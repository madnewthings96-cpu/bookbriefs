
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-6" style={{ color: '#2F4F4F' }}>
        About Ta7leel
      </h1>
      <div className="prose max-w-none text-gray-800 leading-relaxed space-y-6">
        <p>
          In the modern world, we are drowning in information but starved for wisdom. The path to financial mastery and personal growth is buried under an avalanche of get-rich-quick schemes, fleeting motivational quotes, and overly complex advice. We believe there is a better way.
        </p>
        <p>
          I became obsessed with the minds of legendary traders, psychologists, and habit-building experts. I read everything I could get my hands on—from Mark Douglas's Trading in the Zone to James Clear's Atomic Habits. The answers were all there, but they were scattered across thousands of pages.
        </p>
        <p>
          Ta7leel (تحليل) was founded on a single, powerful principle: to distill. We cut through the noise to bring you the essential, time-tested ideas from the world's greatest thinkers in finance, psychology, and self-development.
        </p>
        <p>
          Our journey began in the trading trenches, where we learned a hard lesson: success isn't about finding a secret indicator or a magic formula. It's about building a robust mental framework, mastering your psychology, and consistently applying proven systems. The best source for these systems? The hundreds of books written by masters who have already walked the path.
        </p>
        <p>
          But who has the time to read them all?
        </p>
        <p>
          That's where we come in.
        </p>
        <p>
          Every summary on Ta7leel is more than just a summary; it's a distillation of actionable wisdom. We extract the core principles and key takeaways that you can apply immediately to your life and your trading. We complement this knowledge with practical, no-nonsense tools—like our position size calculator—designed to help you manage risk and trade with discipline.
        </p>
        <p>
          We are not here to offer you hype. We are here to offer you clarity. Our mission is to provide you with the distilled knowledge and essential tools you need to get serious about your growth.
        </p>
        <p>
          Welcome to Ta7leel. Let's start building your edge, together.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;