-- =====================================================================
-- Arjawinangun Delivery – Tambahan database untuk APLIKASI TOKO (merchant)
-- Jalankan SETELAH schema.sql (admin) dan pelanggan.sql (aplikasi pelanggan).
-- Supabase: SQL Editor > New query > tempel semua > Run. Aman diulang.
-- =====================================================================

create sequence if not exists public.seq_toko_app start 1;

-- Pemilik toko: kelola produk miliknya & lihat pesanan tokonya -----------
drop policy if exists "toko baca produk sendiri" on public.produk;
drop policy if exists "toko tambah produk sendiri" on public.produk;
drop policy if exists "toko ubah produk sendiri" on public.produk;
drop policy if exists "toko hapus produk sendiri" on public.produk;
create policy "toko baca produk sendiri" on public.produk for select to authenticated
  using (merchant_id in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'));
create policy "toko tambah produk sendiri" on public.produk for insert to authenticated
  with check (id like 'PM%' and merchant_id in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'));
create policy "toko ubah produk sendiri" on public.produk for update to authenticated
  using (merchant_id in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'))
  with check (merchant_id in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'));
create policy "toko hapus produk sendiri" on public.produk for delete to authenticated
  using (merchant_id in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'));

drop policy if exists "toko baca pesanan tokonya" on public.pesanan;
create policy "toko baca pesanan tokonya" on public.pesanan for select to authenticated
  using ((data->>'merchant_id') in (select id from public.pengguna where auth_id = auth.uid() and tipe = 'merchant'));

-- Toko yang belum disetujui admin tidak tampil ke pelanggan -------------
create or replace view public.merchant_publik as
select id, nama, status,
       data->>'area' as area, data->>'r' as rating, data->>'adr' as alamat,
       data->'x'->>'kat' as kategori, data->'x'->>'jam' as jam
from public.pengguna
where tipe = 'merchant' and coalesce(data->'x'->>'vf','Disetujui') = 'Disetujui';
grant select on public.merchant_publik to anon, authenticated;

-- Satu akun login hanya untuk satu peran ---------------------------------
create or replace function public.buat_profil_pelanggan(p_nama text, p_hp text, p_alamat text, p_area text)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pid text; ptipe text; em text;
begin
  if uid is null then raise exception 'Belum masuk'; end if;
  select id, tipe into pid, ptipe from public.pengguna where auth_id = uid;
  if pid is not null then
    if ptipe <> 'customer' then raise exception 'Email ini terdaftar sebagai toko/driver. Gunakan email lain untuk pelanggan.'; end if;
    return pid;
  end if;
  if length(trim(coalesce(p_nama,''))) < 2 then raise exception 'Nama wajib diisi'; end if;
  select email into em from auth.users where id = uid;
  pid := 'CA' || nextval('public.seq_pelanggan_app');
  insert into public.pengguna (id, tipe, nama, status, auth_id, data) values (
    pid, 'customer', left(trim(p_nama),100), 'Belum verifikasi', uid,
    jsonb_build_object('id',pid,'t','customer','name',left(trim(p_nama),100),'sub',left(coalesce(p_hp,''),20),
      'area',left(coalesce(p_area,''),80),'n',0,'r','5.0','s','Belum verifikasi',
      'adr',left(coalesce(p_alamat,''),200),'hp',left(coalesce(p_hp,''),20),'plate','',
      'jn',to_char(now(),'Mon YYYY'),
      'x',jsonb_build_object('email',coalesce(em,''),'login','Kata sandi','pay','COD (bayar di tempat)')));
  return pid;
end $$;

-- Pesanan hanya ke toko yang sudah disetujui admin ---------------------
create or replace function public.buat_pesanan(p_merchant_id text, p_items jsonb, p_alamat jsonb, p_catatan text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cust record; mer record; it jsonb; pr record;
  qty int; sub int := 0; ongkir int := 7000; biaya int := 2000; total int;
  items jsonb := '[]'::jsonb; oid text; n bigint; alamat jsonb; dat jsonb;
begin
  if uid is null then raise exception 'Belum masuk'; end if;
  select id, nama, status into cust from public.pengguna where auth_id = uid and tipe = 'customer';
  if cust.id is null then raise exception 'Profil pelanggan belum dibuat'; end if;
  if cust.status = 'Diblokir' then raise exception 'Akun Anda diblokir. Hubungi layanan pelanggan.'; end if;
  if coalesce((select data->>'mt' from public.pengaturan where kunci='sistem'),'0') in ('1','true') then
    raise exception 'Layanan sedang pemeliharaan. Coba lagi nanti.';
  end if;
  select id, nama, status into mer from public.pengguna where id = p_merchant_id and tipe = 'merchant';
  if mer.id is null or mer.status <> 'Buka' then raise exception 'Toko sedang tutup.'; end if;
  if coalesce((select data->'x'->>'vf' from public.pengguna where id = mer.id),'Disetujui') <> 'Disetujui' then raise exception 'Toko sedang tutup.'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then
    raise exception 'Keranjang kosong atau terlalu banyak item.';
  end if;
  for it in select * from jsonb_array_elements(p_items) loop
    qty := coalesce((it->>'qty')::int, 0);
    if qty < 1 or qty > 50 then raise exception 'Jumlah item tidak valid.'; end if;
    select id, nama, harga, stok, aktif into pr from public.produk_publik
      where id = it->>'id' and merchant_id = p_merchant_id;
    if pr.id is null or not pr.aktif then raise exception 'Ada produk yang sudah tidak tersedia.'; end if;
    if pr.stok < qty then raise exception 'Stok % tidak cukup.', pr.nama; end if;
    sub := sub + pr.harga * qty;
    items := items || jsonb_build_array(jsonb_build_object(
      'id', pr.id, 'name', pr.nama, 'price', pr.harga, 'quantity', qty,
      'notes', left(coalesce(it->>'catatan',''),120)));
  end loop;
  if length(trim(coalesce(p_alamat->>'streetAddress',''))) < 5 then raise exception 'Alamat pengiriman belum lengkap.'; end if;
  alamat := jsonb_build_object(
    'label', left(coalesce(p_alamat->>'label','Rumah'),30),
    'recipientName', left(coalesce(p_alamat->>'recipientName',cust.nama),100),
    'phone', left(coalesce(p_alamat->>'phone',''),20),
    'streetAddress', left(p_alamat->>'streetAddress',200),
    'village', left(coalesce(p_alamat->>'village',''),80),
    'district', left(coalesce(p_alamat->>'district',''),80),
    'city', left(coalesce(p_alamat->>'city',''),80),
    'notes', left(coalesce(p_alamat->>'notes',''),200),
    'latitude', coalesce((p_alamat->>'latitude')::numeric,0),
    'longitude', coalesce((p_alamat->>'longitude')::numeric,0));
  total := sub + ongkir + biaya;
  loop
    n := nextval('public.seq_pesanan_app'); oid := 'ORD-' || n;
    exit when not exists (select 1 from public.pesanan where id = oid);
  end loop;
  dat := jsonb_build_object('id',oid,'c',cust.nama,'m',mer.nama,'d','','s','Baru','p',total,
    'merchant_id',mer.id,'service','food','items',items,'subtotal',sub,'ongkir',ongkir,
    'biaya_layanan',biaya,'metode','COD','alamat',alamat,
    'catatan',left(coalesce(p_catatan,''),300),'dibuat',to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'));
  insert into public.pesanan (id, status, total, pelanggan_auth_id, data) values (oid,'Baru',total,uid,dat);
  return jsonb_build_object('id',oid,'status','Baru','total',total,'data',dat);
end $$;


-- Pendaftaran toko baru: status Tutup + verifikasi "Menunggu" ------------
create or replace function public.daftar_toko(
  p_pemilik text, p_hp text, p_nama_toko text, p_kategori text, p_alamat text,
  p_desa text, p_jam text, p_deskripsi text, p_lat numeric, p_lng numeric)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pid text; ptipe text; em text;
begin
  if uid is null then raise exception 'Belum masuk'; end if;
  select id, tipe into pid, ptipe from public.pengguna where auth_id = uid;
  if pid is not null then
    if ptipe <> 'merchant' then raise exception 'Email ini sudah dipakai untuk akun pelanggan/driver. Gunakan email lain.'; end if;
    return pid;
  end if;
  if length(trim(coalesce(p_nama_toko,''))) < 3 then raise exception 'Nama toko minimal 3 huruf'; end if;
  if length(trim(coalesce(p_pemilik,''))) < 2 then raise exception 'Nama pemilik wajib diisi'; end if;
  if length(trim(coalesce(p_alamat,''))) < 5 then raise exception 'Alamat toko wajib diisi'; end if;
  select email into em from auth.users where id = uid;
  pid := 'MA' || nextval('public.seq_toko_app');
  insert into public.pengguna (id, tipe, nama, status, auth_id, data) values (
    pid, 'merchant', left(trim(p_nama_toko),100), 'Tutup', uid,
    jsonb_build_object('id',pid,'t','merchant','name',left(trim(p_nama_toko),100),
      'sub',left(trim(p_pemilik),100),'area',left(coalesce(p_desa,''),80),'n',0,'r','5.0','s','Tutup',
      'adr',left(trim(p_alamat),200),'hp',left(coalesce(p_hp,''),20),'plate','',
      'jn',to_char(now(),'Mon YYYY'),
      'x',jsonb_build_object('email',coalesce(em,''),'login','Kata sandi',
        'gps',coalesce(p_lat,-6.6432)::text || ', ' || coalesce(p_lng,108.4125)::text,
        'kat',left(coalesce(nullif(p_kategori,''),'Makanan'),40),
        'jam',left(coalesce(nullif(p_jam,''),'07.00-21.00'),20),
        'desc',left(coalesce(p_deskripsi,''),300),'vf','Menunggu')));
  return pid;
end $$;

create or replace function public.ubah_status_toko(p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare m record;
begin
  if p_status not in ('Buka','Tutup') then raise exception 'Status tidak valid'; end if;
  select id, status, data into m from public.pengguna where auth_id = auth.uid() and tipe = 'merchant';
  if m.id is null then raise exception 'Toko tidak ditemukan'; end if;
  if m.status = 'Ditangguhkan' then raise exception 'Toko Anda sedang ditangguhkan admin.'; end if;
  if coalesce(m.data->'x'->>'vf','Disetujui') <> 'Disetujui' then raise exception 'Toko belum disetujui admin.'; end if;
  update public.pengguna set status = p_status, data = data || jsonb_build_object('s', p_status) where id = m.id;
end $$;

create or replace function public.ubah_profil_toko(p_alamat text, p_hp text, p_jam text, p_deskripsi text)
returns void language plpgsql security definer set search_path = public as $$
declare mid text;
begin
  select id into mid from public.pengguna where auth_id = auth.uid() and tipe = 'merchant';
  if mid is null then raise exception 'Toko tidak ditemukan'; end if;
  update public.pengguna set data =
    data || jsonb_build_object(
      'adr', left(coalesce(p_alamat, data->>'adr'),200),
      'hp',  left(coalesce(p_hp, data->>'hp'),20),
      'x',   (coalesce(data->'x','{}'::jsonb)) || jsonb_build_object(
               'jam',  left(coalesce(nullif(p_jam,''), data->'x'->>'jam'),20),
               'desc', left(coalesce(p_deskripsi, data->'x'->>'desc'),300)))
  where id = mid;
end $$;

-- Aksi toko atas pesanan: terima / siapkan / siap / tolak ----------------
create or replace function public.aksi_pesanan(p_id text, p_aksi text, p_alasan text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m record; o record; ns text; nt text; dat jsonb;
begin
  select id, status, data into m from public.pengguna where auth_id = auth.uid() and tipe = 'merchant';
  if m.id is null then raise exception 'Toko tidak ditemukan'; end if;
  if coalesce(m.data->'x'->>'vf','Disetujui') <> 'Disetujui' or m.status = 'Ditangguhkan' then
    raise exception 'Toko belum aktif.'; end if;
  select id, status, data into o from public.pesanan where id = p_id and data->>'merchant_id' = m.id for update;
  if o.id is null then raise exception 'Pesanan tidak ditemukan'; end if;
  ns := o.status; nt := coalesce(o.data->>'tahap','');
  if p_aksi = 'terima' and o.status = 'Baru' then ns := 'Diproses'; nt := 'Diterima';
  elsif p_aksi = 'siapkan' and o.status = 'Diproses' and nt in ('Diterima','') then nt := 'Disiapkan';
  elsif p_aksi = 'siap' and o.status = 'Diproses' and nt in ('Diterima','Disiapkan','') then nt := 'Siap Diambil';
  elsif p_aksi = 'tolak' and (o.status = 'Baru' or (o.status = 'Diproses' and coalesce(o.data->>'d','') = '' and nt <> 'Siap Diambil')) then
    ns := 'Dibatalkan';
  else raise exception 'Aksi tidak bisa dilakukan pada status pesanan saat ini.'; end if;
  dat := o.data || jsonb_build_object('s', ns, 'tahap', nt);
  if p_aksi = 'tolak' then dat := dat || jsonb_build_object('alasan_tolak', left(coalesce(trim(p_alasan),''),200)); end if;
  update public.pesanan set status = ns, data = dat where id = o.id;
  return jsonb_build_object('id', o.id, 'status', ns, 'total', (dat->>'p')::int, 'data', dat);
end $$;

revoke all on function public.buat_profil_pelanggan(text,text,text,text) from public, anon;
revoke all on function public.daftar_toko(text,text,text,text,text,text,text,text,numeric,numeric) from public, anon;
revoke all on function public.ubah_status_toko(text) from public, anon;
revoke all on function public.ubah_profil_toko(text,text,text,text) from public, anon;
revoke all on function public.aksi_pesanan(text,text,text) from public, anon;
grant execute on function public.buat_profil_pelanggan(text,text,text,text) to authenticated;
grant execute on function public.daftar_toko(text,text,text,text,text,text,text,text,numeric,numeric) to authenticated;
grant execute on function public.ubah_status_toko(text) to authenticated;
grant execute on function public.ubah_profil_toko(text,text,text,text) to authenticated;
grant execute on function public.aksi_pesanan(text,text,text) to authenticated;
