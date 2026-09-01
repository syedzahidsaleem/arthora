import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:arthora_mobile/features/fund_detail/models/fund_detail_model.dart';
import 'package:arthora_mobile/features/fund_detail/widgets/fund_header_section.dart';
import 'package:arthora_mobile/features/fund_detail/widgets/sip_calculator_widget.dart';

void main() {
  testWidgets('FundHeaderSection renders scheme name, category, and NAV', (tester) async {
    const fund = FundMetadata(
      schemeCode: 118778,
      schemeName: 'Mirae Asset Large Cap Fund - Direct Plan - Growth',
      category: 'Large_Cap',
      latestNAV: 112.45,
      navChangePercent: 1.25,
      aum: 34000000000,
    );

    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: FundHeaderSection(fund: fund),
        ),
      ),
    );

    expect(find.text('Mirae Asset Large Cap Fund - Direct Plan - Growth'), findsOneWidget);
    expect(find.text('LARGE CAP'), findsOneWidget);
    expect(find.text('₹112.45'), findsOneWidget);
    expect(find.text('+1.25% (1D)'), findsOneWidget);
  });

  testWidgets('SIPCalculatorWidget renders sliders and computed output', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: SIPCalculatorWidget(defaultCAGR: 15.0),
        ),
      ),
    );

    expect(find.text('SIP COMPOUND CALCULATOR'), findsOneWidget);
    expect(find.text('TOTAL EXPECTED CORPUS'), findsOneWidget);
    expect(find.text('Monthly Investment'), findsOneWidget);
  });
}
