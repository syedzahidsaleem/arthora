import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arthora_mobile/features/watchlist/models/favorite_model.dart';
import 'package:arthora_mobile/features/watchlist/widgets/watchlist_fund_tile.dart';
import 'package:arthora_mobile/features/watchlist/widgets/watchlist_stock_tile.dart';

void main() {
  testWidgets('WatchlistFundTile renders scheme name and NAV', (tester) async {
    const fund = FavoriteFundModel(
      id: 'fav_1',
      schemeCode: 118778,
      name: 'Parag Parikh Flexi Cap Fund',
      category: 'Flexi_Cap',
      latestNAV: 68.25,
      cagr1Y: 24.5,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: WatchlistFundTile(
            fund: fund,
            onDismissed: () {},
          ),
        ),
      ),
    );

    expect(find.text('Parag Parikh Flexi Cap Fund'), findsOneWidget);
    expect(find.text('Flexi Cap'), findsOneWidget);
    expect(find.text('₹68.25'), findsOneWidget);
    expect(find.text('+24.5% 1Y'), findsOneWidget);
  });

  testWidgets('WatchlistStockTile renders stock symbol and price', (tester) async {
    const stock = FavoriteStockModel(
      id: 'fav_2',
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      currentPrice: 4120.50,
      changePercent: 1.85,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: WatchlistStockTile(
            stock: stock,
            onDismissed: () {},
          ),
        ),
      ),
    );

    expect(find.text('TCS'), findsOneWidget);
    expect(find.text('Tata Consultancy Services Ltd'), findsOneWidget);
    expect(find.text('₹4,120.50'), findsOneWidget);
    expect(find.text('+1.85%'), findsOneWidget);
  });
}
