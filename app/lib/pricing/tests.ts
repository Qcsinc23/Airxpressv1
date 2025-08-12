// app/lib/pricing/tests.ts
// Comprehensive test suite for pricing engine validation

import { PricingEngine } from './engine';
import type { CostCalculationInput, PricingPolicy } from './types';

export class PricingTests {
  private engine: PricingEngine;

  constructor() {
    this.engine = new PricingEngine(PricingEngine.getDefaultPolicy());
  }

  /**
   * Test the worked examples from the specification
   */
  async runWorkedExamples(): Promise<{ passed: boolean; results: any[] }> {
    const results = [];
    let allPassed = true;

    // Test Case 1: 28kg eligible (within JetPak limits)
    try {
      const input1: CostCalculationInput = {
        pieces: [{ weightKg: 28, type: 'barrel' }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost1 = await this.engine.calculateCost(input1);
      const sell1 = this.engine.applyMarkup(cost1, false); // Not paid outside USA
      const sell1OutsideUSA = this.engine.applyMarkup(cost1, true); // Paid outside USA

      const expected1 = {
        cost: 120.28,
        sellNormal: 217,
        sellOutsideUSA: 239,
      };

      const result1 = {
        testCase: '28kg JetPak',
        expected: expected1,
        actual: {
          cost: cost1.subtotal,
          sellNormal: sell1.total,
          sellOutsideUSA: sell1OutsideUSA.total,
        },
        passed: Math.abs(cost1.subtotal - expected1.cost) < 0.5 &&
               Math.abs(sell1.total - expected1.sellNormal) < 2 &&
               Math.abs(sell1OutsideUSA.total - expected1.sellOutsideUSA) < 2,
      };

      results.push(result1);
      if (!result1.passed) allPassed = false;

    } catch (error) {
      results.push({
        testCase: '28kg JetPak',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    // Test Case 2: 34kg (overweight scenario)
    try {
      const input2: CostCalculationInput = {
        pieces: [{ weightKg: 34, type: 'barrel' }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost2 = await this.engine.calculateCost(input2);
      const sell2 = this.engine.applyMarkup(cost2, true); // Paid outside USA

      const expectedCost2 = 120.28 + (4 * 4.74); // Base + overweight
      const expectedSell2 = Math.ceil(expectedCost2 * 1.8); // Apply markup and round
      const expectedSurcharge2 = expectedSell2 * 0.1; // 10% surcharge
      const expectedTotal2 = expectedSell2 + expectedSurcharge2;

      const result2 = {
        testCase: '34kg Overweight + Outside USA',
        expected: {
          cost: expectedCost2,
          sell: expectedTotal2,
          overweightFee: 4 * 4.74,
        },
        actual: {
          cost: cost2.subtotal,
          sell: sell2.total,
          overweightFee: cost2.overweight,
        },
        passed: Math.abs(cost2.subtotal - expectedCost2) < 0.5 &&
               Math.abs(sell2.total - expectedTotal2) < 5 &&
               Math.abs(cost2.overweight - (4 * 4.74)) < 0.1,
      };

      results.push(result2);
      if (!result2.passed) allPassed = false;

    } catch (error) {
      results.push({
        testCase: '34kg Overweight + Outside USA',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    return { passed: allPassed, results };
  }

  /**
   * Test JetPak eligibility guardrails
   */
  async testEligibilityGuardrails(): Promise<{ passed: boolean; results: any[] }> {
    const results = [];
    let allPassed = true;

    // Test weight limit (50 lbs = ~23kg)
    try {
      const heavyInput: CostCalculationInput = {
        pieces: [{ weightKg: 25, type: 'barrel' }], // Over 23kg limit
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      try {
        await this.engine.calculateCost(heavyInput);
        results.push({
          testCase: 'Weight Limit Check',
          expected: 'Should throw eligibility error',
          actual: 'No error thrown',
          passed: false,
        });
        allPassed = false;
      } catch (error) {
        const passed = error instanceof Error && error.message.includes('JetPak weight limit');
        results.push({
          testCase: 'Weight Limit Check',
          expected: 'Eligibility error for >23kg',
          actual: error instanceof Error ? error.message : 'Unknown error',
          passed,
        });
        if (!passed) allPassed = false;
      }
    } catch (error) {
      results.push({
        testCase: 'Weight Limit Check',
        error: 'Test setup failed',
        passed: false,
      });
      allPassed = false;
    }

    // Test dimension limit (62 inches = ~157cm total)
    try {
      const oversizedInput: CostCalculationInput = {
        pieces: [{
          weightKg: 20, // Within weight limit
          dimensions: {
            lengthCm: 60,
            widthCm: 60,
            heightCm: 60, // Total: 180cm > 157cm limit
          },
          type: 'box',
        }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      try {
        await this.engine.calculateCost(oversizedInput);
        results.push({
          testCase: 'Dimension Limit Check',
          expected: 'Should throw eligibility error',
          actual: 'No error thrown',
          passed: false,
        });
        allPassed = false;
      } catch (error) {
        const passed = error instanceof Error && error.message.includes('JetPak dimension limits');
        results.push({
          testCase: 'Dimension Limit Check',
          expected: 'Eligibility error for >157cm total',
          actual: error instanceof Error ? error.message : 'Unknown error',
          passed,
        });
        if (!passed) allPassed = false;
      }
    } catch (error) {
      results.push({
        testCase: 'Dimension Limit Check',
        error: 'Test setup failed',
        passed: false,
      });
      allPassed = false;
    }

    return { passed: allPassed, results };
  }

  /**
   * Test markup application and rounding rules
   */
  async testMarkupAndRounding(): Promise<{ passed: boolean; results: any[] }> {
    const results = [];
    let allPassed = true;

    // Test basic markup application
    try {
      const testInput: CostCalculationInput = {
        pieces: [{ weightKg: 1, type: 'barrel' }], // Minimal weight
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost = await this.engine.calculateCost(testInput);
      const sell = this.engine.applyMarkup(cost, false);

      // Verify markup calculation
      const expectedFreightSell = Math.ceil(cost.freight * 1.8);
      const markupCorrect = Math.abs(sell.freight - expectedFreightSell) < 0.01;
      
      results.push({
        testCase: 'Basic Markup Application',
        expected: `Freight: $${expectedFreightSell}`,
        actual: `Freight: $${sell.freight}`,
        passed: markupCorrect,
      });
      
      if (!markupCorrect) allPassed = false;

    } catch (error) {
      results.push({
        testCase: 'Basic Markup Application',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    // Test minimum sell price
    try {
      // Create a scenario where calculated price would be below $35
      const lowCostInput: CostCalculationInput = {
        pieces: [{ weightKg: 0.5, type: 'barrel' }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost = await this.engine.calculateCost(lowCostInput);
      const sell = this.engine.applyMarkup(cost, false);

      const minPriceEnforced = sell.total >= 35;
      results.push({
        testCase: 'Minimum Sell Price',
        expected: 'Total >= $35',
        actual: `Total: $${sell.total}`,
        passed: minPriceEnforced,
      });

      if (!minPriceEnforced) allPassed = false;

    } catch (error) {
      results.push({
        testCase: 'Minimum Sell Price',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    return { passed: allPassed, results };
  }

  /**
   * Test "Paid Outside USA" surcharge logic
   */
  async testOutsideUSASurcharge(): Promise<{ passed: boolean; results: any[] }> {
    const results = [];
    let allPassed = true;

    // Test flat fee for subtotal < $100
    try {
      const lowInput: CostCalculationInput = {
        pieces: [{ weightKg: 5, type: 'barrel' }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost = await this.engine.calculateCost(lowInput);
      const sellWithoutSurcharge = this.engine.applyMarkup(cost, false);
      const sellWithSurcharge = this.engine.applyMarkup(cost, true);

      // Should add $10 flat fee if subtotal < $100
      const expectedSurcharge = sellWithoutSurcharge.subtotal < 100 ? 10 : sellWithoutSurcharge.subtotal * 0.1;
      const actualSurcharge = sellWithSurcharge.surcharge;

      const surchargeCorrect = Math.abs(actualSurcharge - expectedSurcharge) < 0.01;
      results.push({
        testCase: 'Outside USA Surcharge (Low Amount)',
        expected: `Surcharge: $${expectedSurcharge}`,
        actual: `Surcharge: $${actualSurcharge}`,
        passed: surchargeCorrect,
      });

      if (!surchargeCorrect) allPassed = false;

    } catch (error) {
      results.push({
        testCase: 'Outside USA Surcharge (Low Amount)',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    // Test percentage for subtotal >= $100
    try {
      const highInput: CostCalculationInput = {
        pieces: [{ weightKg: 25, type: 'barrel' }], // This should generate >$100 subtotal
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      // Note: This will likely throw eligibility error for >23kg, but let's test with 23kg
      const adjustedInput: CostCalculationInput = {
        pieces: [{ weightKg: 23, type: 'barrel' }],
        origin: 'JFK',
        destination: 'GEO',
        serviceLevel: 'STANDARD',
      };

      const cost = await this.engine.calculateCost(adjustedInput);
      const sellWithoutSurcharge = this.engine.applyMarkup(cost, false);
      const sellWithSurcharge = this.engine.applyMarkup(cost, true);

      if (sellWithoutSurcharge.subtotal >= 100) {
        const expectedSurcharge = sellWithoutSurcharge.subtotal * 0.1;
        const actualSurcharge = sellWithSurcharge.surcharge;
        const surchargeCorrect = Math.abs(actualSurcharge - expectedSurcharge) < 0.01;

        results.push({
          testCase: 'Outside USA Surcharge (High Amount)',
          expected: `10% of $${sellWithoutSurcharge.subtotal} = $${expectedSurcharge}`,
          actual: `Surcharge: $${actualSurcharge}`,
          passed: surchargeCorrect,
        });

        if (!surchargeCorrect) allPassed = false;
      } else {
        results.push({
          testCase: 'Outside USA Surcharge (High Amount)',
          expected: 'Subtotal >= $100 for percentage test',
          actual: `Subtotal: $${sellWithoutSurcharge.subtotal}`,
          passed: false,
          note: 'Could not test percentage surcharge - subtotal too low',
        });
      }

    } catch (error) {
      results.push({
        testCase: 'Outside USA Surcharge (High Amount)',
        error: error instanceof Error ? error.message : 'Unknown error',
        passed: false,
      });
      allPassed = false;
    }

    return { passed: allPassed, results };
  }

  /**
   * Run all pricing tests
   */
  async runAllTests(): Promise<{
    passed: boolean;
    summary: {
      total: number;
      passed: number;
      failed: number;
    };
    categories: {
      workedExamples: any;
      eligibilityGuardrails: any;
      markupAndRounding: any;
      outsideUSASurcharge: any;
    };
  }> {
    console.log('🧪 Running comprehensive pricing tests...\n');

    const workedExamples = await this.runWorkedExamples();
    const eligibilityGuardrails = await this.testEligibilityGuardrails();
    const markupAndRounding = await this.testMarkupAndRounding();
    const outsideUSASurcharge = await this.testOutsideUSASurcharge();

    const allResults = [
      ...workedExamples.results,
      ...eligibilityGuardrails.results,
      ...markupAndRounding.results,
      ...outsideUSASurcharge.results,
    ];

    const totalPassed = allResults.filter(r => r.passed).length;
    const totalTests = allResults.length;
    const overallPassed = workedExamples.passed && eligibilityGuardrails.passed && 
                         markupAndRounding.passed && outsideUSASurcharge.passed;

    // Log results
    console.log('📊 Test Results Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Overall: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\n`);

    return {
      passed: overallPassed,
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalTests - totalPassed,
      },
      categories: {
        workedExamples,
        eligibilityGuardrails,
        markupAndRounding,
        outsideUSASurcharge,
      },
    };
  }
}

// Export convenience function to run tests
export async function runPricingTests() {
  const tester = new PricingTests();
  return await tester.runAllTests();
}