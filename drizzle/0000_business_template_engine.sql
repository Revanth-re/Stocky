CREATE TABLE `users` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(191) NOT NULL,
	`phone` varchar(20),
	`password_hash` varchar(255) NOT NULL,
	`role` enum('owner','manager','employee') NOT NULL DEFAULT 'employee',
	`avatar_url` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`email_verified_at` varchar(64),
	`reset_password_token` varchar(191),
	`reset_password_expires_at` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` varchar(21) NOT NULL,
	`name` varchar(160) NOT NULL,
	`owner_name` varchar(120) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`gst_number` varchar(20),
	`upi_id` varchar(120),
	`address` text,
	`city` varchar(120),
	`state` varchar(120),
	`pincode` varchar(12),
	`business_template` enum('grocery','pharmacy','fashion','electronics','hardware','food','automobile','furniture','cosmetics','books','agriculture','custom') NOT NULL DEFAULT 'grocery',
	`logo_url` varchar(512),
	`selected_brand_slugs` json DEFAULT ('[]'),
	`enabled_modules` json DEFAULT ('null'),
	`enabled_ai_features` json DEFAULT ('null'),
	`template_settings` json DEFAULT ('{}'),
	`currency` varchar(8) NOT NULL DEFAULT 'INR',
	`timezone` varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
	`onboarding_step` varchar(32) NOT NULL DEFAULT 'store_info',
	`onboarding_completed_at` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`name` varchar(160) NOT NULL,
	`contact_person` varchar(120),
	`phone` varchar(20),
	`email` varchar(191),
	`address` text,
	`gst_number` varchar(20),
	`notes` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(21) NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`logo_url` varchar(512),
	`is_global` boolean NOT NULL DEFAULT true,
	`store_id` varchar(21),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21),
	`name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`icon` varchar(64),
	`parent_id` varchar(21),
	`is_global` varchar(5) NOT NULL DEFAULT 'true',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`sku` varchar(64) NOT NULL,
	`barcode` varchar(64),
	`image_url` varchar(512),
	`brand_id` varchar(21),
	`category_id` varchar(21),
	`supplier_id` varchar(21),
	`unit` varchar(32) NOT NULL DEFAULT 'pcs',
	`pack_size` varchar(32),
	`pricing_type` enum('unit','weight') NOT NULL DEFAULT 'unit',
	`purchase_price` decimal(12,2) NOT NULL DEFAULT '0',
	`selling_price` decimal(12,2) NOT NULL DEFAULT '0',
	`tax_percent` decimal(5,2) NOT NULL DEFAULT '0',
	`min_stock` int NOT NULL DEFAULT 5,
	`max_stock` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`source` varchar(16) NOT NULL DEFAULT 'catalog',
	`custom_fields` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`quantity` decimal(12,3) NOT NULL DEFAULT 0,
	`reserved_quantity` decimal(12,3) NOT NULL DEFAULT 0,
	`status` enum('good','medium','low','critical','out_of_stock') NOT NULL DEFAULT 'good',
	`last_restocked_at` varchar(64),
	`last_sold_at` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_product_id_unique` UNIQUE(`product_id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`invoice_number` varchar(32) NOT NULL,
	`sold_by_id` varchar(21) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`tax_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`total_amount` decimal(12,2) NOT NULL,
	`payment_method` enum('cash','upi','card','credit') NOT NULL DEFAULT 'cash',
	`status` enum('completed','refunded','voided') NOT NULL DEFAULT 'completed',
	`customer_name` varchar(120),
	`customer_phone` varchar(20),
	`customer_id` varchar(21),
	`applied_bundle_id` varchar(21),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` varchar(21) NOT NULL,
	`sale_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`quantity` decimal(10,3) NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`discount_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`line_total` decimal(12,2) NOT NULL,
	CONSTRAINT `sale_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`po_number` varchar(32) NOT NULL,
	`supplier_id` varchar(21) NOT NULL,
	`created_by_id` varchar(21) NOT NULL,
	`status` enum('draft','ordered','received','cancelled') NOT NULL DEFAULT 'draft',
	`total_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`expected_delivery_date` varchar(32),
	`received_at` varchar(64),
	`notes` text,
	`sourced_from_forecast` varchar(5) NOT NULL DEFAULT 'false',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` varchar(21) NOT NULL,
	`purchase_order_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`quantity_ordered` decimal(12,3) NOT NULL,
	`quantity_received` decimal(12,3) NOT NULL DEFAULT 0,
	`unit_cost` decimal(12,2) NOT NULL,
	`line_total` decimal(12,2) NOT NULL,
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`current_stock` int NOT NULL,
	`predicted_demand` int NOT NULL,
	`suggested_order_qty` int NOT NULL,
	`confidence_score` decimal(5,2) NOT NULL,
	`priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`status` enum('pending','ready','stale','failed') NOT NULL DEFAULT 'ready',
	`reason` text,
	`model_meta` json,
	`series` json,
	`will_stock_out_at` varchar(32),
	`generated_at` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`user_id` varchar(21),
	`type` enum('low_stock','critical_stock','purchase_order','sale','ai_forecast_ready','system_alert') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`metadata` json,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`user_id` varchar(21),
	`entity_type` enum('product','inventory','sale','purchase_order','supplier','user','forecast','settings','customer','bundle') NOT NULL,
	`entity_id` varchar(21) NOT NULL,
	`action` enum('created','updated','deleted','stock_in','stock_out','status_changed','login','logout','payment_recorded') NOT NULL,
	`description` text NOT NULL,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`category` varchar(64) NOT NULL,
	`key` varchar(120) NOT NULL,
	`value` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_store_category_key_unique` UNIQUE(`store_id`,`category`,`key`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`name` varchar(120) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` text,
	`credit_limit` decimal(12,2) NOT NULL DEFAULT 0,
	`current_balance` decimal(12,2) NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_store_phone_unique` UNIQUE(`store_id`,`phone`)
);
--> statement-breakpoint
CREATE TABLE `customer_transactions` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`customer_id` varchar(21) NOT NULL,
	`sale_id` varchar(21),
	`type` enum('credit_sale','payment','adjustment') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`balance_after` decimal(12,2) NOT NULL,
	`note` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_bundles` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` varchar(400),
	`combo_price` decimal(12,2) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_bundle_items` (
	`id` varchar(21) NOT NULL,
	`bundle_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	CONSTRAINT `product_bundle_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_supplier_prices` (
	`id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`supplier_id` varchar(21) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_supplier_prices_id` PRIMARY KEY(`id`),
	CONSTRAINT `supplier_prices_product_supplier_unique` UNIQUE(`product_id`,`supplier_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_batches` (
	`id` varchar(21) NOT NULL,
	`store_id` varchar(21) NOT NULL,
	`product_id` varchar(21) NOT NULL,
	`quantity` decimal(12,3) NOT NULL,
	`expiry_date` date,
	`source` enum('initial','purchase_order') NOT NULL DEFAULT 'initial',
	`purchase_order_id` varchar(21),
	`received_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `users_store_id_idx` ON `users` (`store_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `suppliers_store_id_idx` ON `suppliers` (`store_id`);--> statement-breakpoint
CREATE INDEX `brands_slug_idx` ON `brands` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_store_id_idx` ON `categories` (`store_id`);--> statement-breakpoint
CREATE INDEX `products_store_id_idx` ON `products` (`store_id`);--> statement-breakpoint
CREATE INDEX `products_sku_idx` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `products_barcode_idx` ON `products` (`barcode`);--> statement-breakpoint
CREATE INDEX `products_brand_id_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `products_category_id_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_supplier_id_idx` ON `products` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `inventory_store_id_idx` ON `inventory` (`store_id`);--> statement-breakpoint
CREATE INDEX `sales_store_id_idx` ON `sales` (`store_id`);--> statement-breakpoint
CREATE INDEX `sales_invoice_number_idx` ON `sales` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `sales_sold_by_id_idx` ON `sales` (`sold_by_id`);--> statement-breakpoint
CREATE INDEX `sales_customer_id_idx` ON `sales` (`customer_id`);--> statement-breakpoint
CREATE INDEX `sale_items_sale_id_idx` ON `sale_items` (`sale_id`);--> statement-breakpoint
CREATE INDEX `sale_items_product_id_idx` ON `sale_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `purchase_orders_store_id_idx` ON `purchase_orders` (`store_id`);--> statement-breakpoint
CREATE INDEX `purchase_orders_supplier_id_idx` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `purchase_orders_status_idx` ON `purchase_orders` (`status`);--> statement-breakpoint
CREATE INDEX `po_items_po_id_idx` ON `purchase_order_items` (`purchase_order_id`);--> statement-breakpoint
CREATE INDEX `po_items_product_id_idx` ON `purchase_order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `forecasts_store_id_idx` ON `forecasts` (`store_id`);--> statement-breakpoint
CREATE INDEX `forecasts_product_id_idx` ON `forecasts` (`product_id`);--> statement-breakpoint
CREATE INDEX `forecasts_priority_idx` ON `forecasts` (`priority`);--> statement-breakpoint
CREATE INDEX `notifications_store_id_idx` ON `notifications` (`store_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `activity_logs_store_id_idx` ON `activity_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_entity_idx` ON `activity_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `activity_logs_user_id_idx` ON `activity_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `settings_store_id_idx` ON `settings` (`store_id`);--> statement-breakpoint
CREATE INDEX `customers_store_id_idx` ON `customers` (`store_id`);--> statement-breakpoint
CREATE INDEX `customer_txns_store_id_idx` ON `customer_transactions` (`store_id`);--> statement-breakpoint
CREATE INDEX `customer_txns_customer_id_idx` ON `customer_transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `product_bundles_store_id_idx` ON `product_bundles` (`store_id`);--> statement-breakpoint
CREATE INDEX `bundle_items_bundle_id_idx` ON `product_bundle_items` (`bundle_id`);--> statement-breakpoint
CREATE INDEX `bundle_items_product_id_idx` ON `product_bundle_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `supplier_prices_product_id_idx` ON `product_supplier_prices` (`product_id`);--> statement-breakpoint
CREATE INDEX `supplier_prices_supplier_id_idx` ON `product_supplier_prices` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `inventory_batches_store_id_idx` ON `inventory_batches` (`store_id`);--> statement-breakpoint
CREATE INDEX `inventory_batches_product_id_idx` ON `inventory_batches` (`product_id`);--> statement-breakpoint
CREATE INDEX `inventory_batches_expiry_date_idx` ON `inventory_batches` (`expiry_date`);