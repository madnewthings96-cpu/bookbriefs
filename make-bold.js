const fs = require('fs');
const content = fs.readFileSync('constants.ts', 'utf8');

// Find the One Up on Wall Street summary
const startMarker = "id: 'one-up-on-wall-street',";
const startIndex = content.lastIndexOf(startMarker);

// Find the summary start
const summaryStart = content.indexOf('summary: `', startIndex);
const summaryContentStart = summaryStart + 'summary: `'.length;

// Find the summary end
const summaryEnd = content.indexOf('`,', summaryContentStart);

// Extract the summary
let summary = content.substring(summaryContentStart, summaryEnd);

// Split into lines for processing
const lines = summary.split('\n');
const processedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const trimmed = line.trim();
  
  // Skip empty lines or already bold lines
  if (!trimmed || line.includes('**')) {
    processedLines.push(line);
    continue;
  }
  
  // List of exact titles and headings to make bold
  const titlesAndHeadings = [
    'One Up on Wall Street',
    'How to Use What You Already Know to Make Money in the Market',
    'Introduction: A Declaration of Independence for the Individual Investor',
    'Who is Peter Lynch?',
    'The Core Philosophy',
    'Part I: The Lynch Advantage - Empowering the Individual Investor',
    'The Amateur\'s Edge Over the Professional',
    'Advantage 1: Freedom from Institutional Imperative and Herd Mentality',
    'The Professional\'s Dilemma:',
    'The Result:',
    'The Individual\'s Advantage:',
    'Advantage 2: Agility and Access to Micro-Caps',
    'The Size Problem for Big Funds:',
    'Advantage 3: Freedom from Short-Term Thinking',
    'Institutional Constraints:',
    'The "Local Edge": Investing in What You Know',
    'Lynch\'s Core Insight:',
    'Real-World Examples from Lynch\'s Career',
    'The Two-Step Process',
    'Step 1: Discover (Local Knowledge)',
    'Step 2: Investigate (Financial Analysis)',
    'Key Principle:',
    'Part II: The Anatomy of a Stock - Six Categories and the Tenbagger',
    'The Six Categories of Stocks',
    'Category 1: Slow Growers',
    'Defining Characteristics:',
    'Financial Markers:',
    'Investment Strategy:',
    'Example:',
    'Risk:',
    'Category 2: Stalwarts',
    'Examples:',
    'Category 3: Fast Growers',
    'Reward:',
    'Category 4: Cyclicals',
    'Category 5: Turnarounds',
    'Category 6: Asset Plays',
    'The Tenbagger: The Engine of Portfolio Growth',
    'The Math of Asymmetric Returns',
    'The Liberating Philosophy',
    'The Strategy:',
    'Where to Find Tenbaggers:',
    'The Promise:',
    'Part III: Lynch\'s Research Methodology - Scuttlebutt, Numbers, and Ratios',
    'Qualitative Research: The Art of Scuttlebutt',
    'Investigating the Company\'s Story',
    'The Pitch Test',
    'The Competitive Advantage (The "Moat")',
    'The Plan for Growth',
    'On-the-Ground Research Questions',
    'When Visiting a Retailer:',
    'When Talking to Customers:',
    'When Talking to Suppliers:',
    'When Analyzing Competitors:',
    'Quantitative Analysis: The Numbers Game',
    '1. The PEG Ratio (Price/Earnings to Growth)',
    'The Problem with P/E Ratio Alone:',
    'Lynch\'s Brilliant Insight:',
    'The Formula:',
    'Interpretation:',
    'Application:',
    'The Rule:',
    '2. The Balance Sheet: Debt and Cash',
    'Debt-to-Equity Ratio',
    'What to Look For:',
    'Lynch\'s Preference:',
    'Cash Position',
    'The Calculation:',
    'What This Represents:',
    'Benefits of Strong Cash Position:',
    '3. Inventories and Free Cash Flow',
    'Inventories',
    'Key Red Flag:',
    'What This Signals:',
    'Free Cash Flow (FCF)',
    'What He Favored:',
    'Core Understanding:',
    'Value Creation:',
    'Part IV: Portfolio Management, Market Fallacies, and Enduring Relevance',
    'The Difficult Art of When to Buy and When to Sell',
    'Valid Reasons for Selling a Stock',
    'Reason 1: The Story Has Deteriorated',
    'Reason 2: Stock Has Reached Target and is Overvalued',
    'Reason 3: You Made a Mistake',
    'Reason 4: Found a Clearly Superior Opportunity',
    'Poor Reasons for Selling a Stock',
    '"You\'ll Never Go Broke Taking a Profit"',
    'The Problem:',
    'Panic Selling in a Market Correction',
    'Lynch\'s View:',
    '"I Have to Get Even"',
    'The Mistake:',
    'Problem:',
    'Market Fallacies: The Six Most Dangerous Sayings',
    'Fallacy 1: "If it\'s gone down this much, it can\'t go any lower"',
    'The Math:',
    'Truth:',
    'Fallacy 2: "If it\'s gone this high, it can\'t go any higher"',
    'Fallacy 3: "It\'s only $3 a share, what can I lose?"',
    'Fallacy 4: "Eventually, they always come back"',
    'Fallacy 5: "It\'s always darkest before the dawn"',
    'Fallacy 6: "Look at all the money I\'ve lost by not buying it!"',
    'The Enduring Relevance in the 21st Century',
    '1. The Internet as the Ultimate Scuttlebutt Tool',
    'Then:',
    'Now:',
    'The Change:',
    'The Constant:',
    'The Advantage:',
    '2. Inefficiencies Created by Passive and Algorithmic Trading',
    'The New Reality:',
    'What This Means:',
    'The Opportunity:',
    '3. Timeless Principles of Business Analysis',
    'The Ultimate Truth:',
    'The Timeless Principles:',
    'The Path to Success:',
    'Conclusion: The Individual Investor\'s Manifesto',
    'The Lynch Method:'
  ];
  
  // Check if line matches any title or heading
  if (titlesAndHeadings.includes(trimmed)) {
    processedLines.push('**' + trimmed + '**');
  } else {
    processedLines.push(line);
  }
}

summary = processedLines.join('\n');

// Reconstruct the file
const newContent = 
  content.substring(0, summaryContentStart) + 
  summary + 
  content.substring(summaryEnd);

fs.writeFileSync('constants.ts', newContent, 'utf8');
console.log('✅ Successfully made titles and headings bold');
