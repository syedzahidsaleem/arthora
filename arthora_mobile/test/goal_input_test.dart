import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:arthora_mobile/features/ai_portfolio/screens/goal_input_screen.dart';

void main() {
  testWidgets('GoalInputScreen renders category chips, sliders, and submit button', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: GoalInputScreen(),
        ),
      ),
    );

    // Verify key elements
    expect(find.text('What are you investing for?'), findsOneWidget);
    expect(find.text('POPULAR GOAL CATEGORIES'), findsOneWidget);
    expect(find.text('Retirement'), findsOneWidget);
    expect(find.text('Home Purchase'), findsOneWidget);
    expect(find.text('Generate AI Portfolio'), findsOneWidget);
  });

  testWidgets('Tapping category chip populates hint in goal text field', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: GoalInputScreen(),
        ),
      ),
    );

    // Tap 'Home Purchase' chip
    await tester.tap(find.text('Home Purchase'));
    await tester.pump();

    // Verify text field contains prefilled hint
    expect(
      find.text('Save ₹50 Lakhs down-payment for 3BHK apartment'),
      findsOneWidget,
    );
  });
}
