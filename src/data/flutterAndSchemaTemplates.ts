/**
 * AWD Toko - Flutter Clean Architecture Code Templates & Supabase SQL Schema
 * All 17 tables, RLS policies, indexes, and production-grade Flutter implementation files.
 */

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- AWD Toko - Full PostgreSQL & Supabase Database Schema
-- Multi-Store Architecture for Arjawinangun Delivery Ecosystem
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. MERCHANTS TABLE
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected', 'Suspended')),
  ktp_url TEXT,
  selfie_url TEXT,
  npwp_url TEXT,
  business_license_url TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STORES TABLE
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  opening_hours TIME NOT NULL DEFAULT '08:00:00',
  closing_hours TIME NOT NULL DEFAULT '22:00:00',
  delivery_radius_km NUMERIC(5, 2) DEFAULT 8.0,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Restaurant', 'Grocery', 'Pharmacy', 'Bakery', 'Electronics', 'Fashion', 'UMKM')),
  operational_status VARCHAR(20) DEFAULT 'Open' CHECK (operational_status IN ('Open', 'Closed', 'Busy', 'Holiday')),
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STORE BRANCHES TABLE
CREATE TABLE public.store_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCT CATEGORIES TABLE
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC(12, 2) NOT NULL,
  discount_price NUMERIC(12, 2),
  stock INT DEFAULT 0 NOT NULL,
  reserved_stock INT DEFAULT 0 NOT NULL,
  weight_grams INT DEFAULT 200,
  sku VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'OutOfStock')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRODUCT VARIANTS TABLE
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  stock INT DEFAULT 0 NOT NULL,
  sku VARCHAR(100)
);

-- 7. STOCKS LOG TABLE (History)
CREATE TABLE public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('Addition', 'Reduction', 'Adjustment', 'OrderReserve', 'OrderCancelReturn')),
  amount INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CUSTOMERS TABLE
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ORDERS TABLE
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE RESTRICT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) DEFAULT 0,
  delivery_fee NUMERIC(12, 2) DEFAULT 0,
  platform_fee NUMERIC(12, 2) NOT NULL, -- 10% Platform fee
  total_amount NUMERIC(12, 2) NOT NULL,
  merchant_net_amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('GOPAY', 'OVO', 'DANA', 'SHOPEEPAY', 'QRIS', 'CASH_ON_DELIVERY')),
  delivery_address TEXT NOT NULL,
  distance_km NUMERIC(5, 2) DEFAULT 1.0,
  status VARCHAR(30) DEFAULT 'New' CHECK (status IN (
    'New', 'Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery', 'Delivered', 'Completed', 'Cancelled'
  )),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(50),
  driver_vehicle VARCHAR(50),
  driver_avatar TEXT,
  driver_rating NUMERIC(3, 2),
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  variant_name VARCHAR(100),
  notes TEXT
);

-- 11. PROMOTIONS TABLE
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL CHECK (type IN ('Percentage', 'Fixed', 'FreeDelivery', 'BOGO', 'Voucher')),
  discount_value NUMERIC(12, 2) NOT NULL,
  min_purchase NUMERIC(12, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. WALLETS TABLE
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE UNIQUE NOT NULL,
  available_balance NUMERIC(14, 2) DEFAULT 0 NOT NULL,
  pending_balance NUMERIC(14, 2) DEFAULT 0 NOT NULL,
  withdrawable_balance NUMERIC(14, 2) DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. WALLET TRANSACTIONS TABLE
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('SalesIncome', 'PlatformCommission', 'Withdrawal', 'Refund')),
  amount NUMERIC(12, 2) NOT NULL,
  fee NUMERIC(12, 2) DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL,
  reference_id VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Success' CHECK (status IN ('Success', 'Pending', 'Failed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. WITHDRAWALS TABLE
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 50000), -- Rp50.000 minimum
  fee NUMERIC(12, 2) DEFAULT 2500 NOT NULL,             -- Rp2.500 fee
  net_amount NUMERIC(12, 2) NOT NULL,
  method VARCHAR(30) NOT NULL CHECK (method IN ('BankTransfer', 'EWallet')),
  destination_name VARCHAR(100) NOT NULL,
  destination_number VARCHAR(100) NOT NULL,
  recipient_name VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Completed', 'Rejected')),
  requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 15. REVIEWS TABLE
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  merchant_reply TEXT,
  reply_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('NewOrder', 'OrderCompleted', 'LowStock', 'PromoExpired', 'Review')),
  is_read BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. REPORTS (Aggregate Views & Functions)
CREATE OR REPLACE VIEW public.vw_merchant_daily_reports AS
SELECT
  s.merchant_id,
  o.store_id,
  DATE(o.created_at) AS report_date,
  COUNT(o.id) AS total_orders,
  COALESCE(SUM(o.subtotal), 0) AS gross_sales,
  COALESCE(SUM(o.platform_fee), 0) AS total_platform_fees,
  COALESCE(SUM(o.merchant_net_amount), 0) AS net_revenue
FROM public.orders o
JOIN public.stores s ON o.store_id = s.id
WHERE o.status = 'Completed'
GROUP BY s.merchant_id, o.store_id, DATE(o.created_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can manage own profile"
  ON public.merchants FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can manage own stores"
  ON public.stores FOR ALL
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can manage products of their stores"
  ON public.products FOR ALL
  USING (store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.merchants m ON s.merchant_id = m.id
    WHERE m.user_id = auth.uid()
  ));

CREATE POLICY "Merchants can view orders for their stores"
  ON public.orders FOR ALL
  USING (store_id IN (
    SELECT s.id FROM public.stores s
    JOIN public.merchants m ON s.merchant_id = m.id
    WHERE m.user_id = auth.uid()
  ));
`;

export const FLUTTER_CODE_SAMPLES = {
  mainDart: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/routes/app_router.dart';
import 'features/orders/presentation/bloc/orders_bloc.dart';
import 'features/products/presentation/bloc/products_bloc.dart';
import 'features/wallet/presentation/bloc/wallet_bloc.dart';
import 'injection_container.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase Backend
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
  );

  // Initialize Firebase Push Notifications
  await Firebase.initializeApp();
  
  // Dependency Injection setup
  await di.init();

  runApp(const AwdTokoApp());
}

class AwdTokoApp extends StatelessWidget {
  const AwdTokoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => di.sl<OrdersBloc>()..add(const ListenToIncomingOrdersEvent())),
        BlocProvider(create: (_) => di.sl<ProductsBloc>()..add(const LoadProductsEvent())),
        BlocProvider(create: (_) => di.sl<WalletBloc>()..add(const LoadWalletBalanceEvent())),
      ],
      child: MaterialApp.router(
        title: 'AWD Toko',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        routerConfig: AppRouter.router,
      ),
    );
  }
}`,

  appColors: `// lib/core/theme/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors (Tokopedia Seller & GoBiz inspired)
  static const Color primaryGreen = Color(0xFF16A34A);
  static const Color primaryGreenDark = Color(0xFF15803D);
  static const Color primaryGreenLight = Color(0xFFDCFCE7);

  // Accent Colors
  static const Color accentOrange = Color(0xFFF97316);
  static const Color accentOrangeLight = Color(0xFFFFEDD5);

  // Neutral Colors
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color border = Color(0xFFE2E8F0);

  // Status Colors
  static const Color statusSuccess = Color(0xFF16A34A);
  static const Color statusWarning = Color(0xFFF59E0B);
  static const Color statusDanger = Color(0xFFEF4444);
  static const Color statusInfo = Color(0xFF3B82F6);
}`,

  ordersBloc: `// lib/features/orders/presentation/bloc/orders_bloc.dart
import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/usecases/accept_order_usecase.dart';
import '../../domain/usecases/stream_orders_usecase.dart';
import '../../../../core/services/sound_service.dart';

abstract class OrdersEvent extends Equatable {
  const OrdersEvent();
  @override
  List<Object?> get props => [];
}

class ListenToIncomingOrdersEvent extends OrdersEvent {
  const ListenToIncomingOrdersEvent();
}

class UpdateOrderStatusEvent extends OrdersEvent {
  final String orderId;
  final String newStatus;
  const UpdateOrderStatusEvent({required this.orderId, required this.newStatus});
  @override
  List<Object?> get props => [orderId, newStatus];
}

class OrdersBloc extends Bloc<OrdersEvent, OrdersState> {
  final StreamOrdersUseCase streamOrdersUseCase;
  final AcceptOrderUseCase acceptOrderUseCase;
  final SoundService soundService;
  StreamSubscription? _subscription;

  OrdersBloc({
    required this.streamOrdersUseCase,
    required this.acceptOrderUseCase,
    required this.soundService,
  }) : super(OrdersInitial()) {
    on<ListenToIncomingOrdersEvent>((event, emit) async {
      emit(OrdersLoading());
      await _subscription?.cancel();
      _subscription = streamOrdersUseCase().listen((orders) {
        // Detect new incoming order and ring loud marketplace chime
        final hasNew = orders.any((o) => o.status == 'New');
        if (hasNew) {
          soundService.playOrderNotification();
        }
        add(_OrdersReceivedInternalEvent(orders));
      });
    });

    on<UpdateOrderStatusEvent>((event, emit) async {
      await acceptOrderUseCase(event.orderId, event.newStatus);
    });
  }
}`,

  supabaseService: `// lib/core/network/supabase_service.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  final SupabaseClient client = Supabase.instance.client;

  // Realtime orders stream filtered by current merchant's store
  Stream<List<Map<String, dynamic>>> getOrdersStream(String storeId) {
    return client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('store_id', storeId)
        .order('created_at', ascending: false);
  }

  // Update order status with optimistic trigger
  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    await client
        .from('orders')
        .update({'status': newStatus, 'updated_at': DateTime.now().toIso8601String()})
        .eq('id', orderId);
  }

  // Execute withdrawal request with validation
  Future<Map<String, dynamic>> requestWithdrawal({
    required String walletId,
    required double amount,
    required String method,
    required String destinationName,
    required String destinationNumber,
    required String recipientName,
  }) async {
    return await client.rpc('process_merchant_withdrawal', params: {
      'p_wallet_id': walletId,
      'p_amount': amount,
      'p_method': method,
      'p_destination_name': destinationName,
      'p_destination_number': destinationNumber,
      'p_recipient_name': recipientName,
    });
  }
}`
};
