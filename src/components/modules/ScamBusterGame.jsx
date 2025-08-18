/*
 * Author: github.com/stzyium
 * Email: styyzy@github.com
 * License: MIT
 * Date: 2025-08-16
 * File: ScamBusterGame.jsx
 */

import React, { useState, useEffect } from 'react';

const ScamBusterGame = () => {
  // Game state
  const [gameState, setGameState] = useState('start'); // start, playing, gameOver, levelComplete
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hints, setHints] = useState(3);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [leaderboard, setLeaderboard] = useState([
    { name: "ScamDetective", score: 2450 },
    { name: "FraudFighter", score: 1980 },
    { name: "PhishingPro", score: 1750 }
  ]);
  const [playerName, setPlayerName] = useState("");

  // Game questions database
  const questions = [
    // Level 1 - Basic Scams
    {
      level: 1,
      category: "Email Scams",
      question: "You receive an email claiming you've won a lottery you never entered. It asks for your bank details to transfer the winnings. What should you do?",
      options: [
        "Provide your bank details to claim the prize",
        "Reply asking for more information about the lottery",
        "Delete the email and report it as spam",
        "Forward the email to friends to see if it's legitimate"
      ],
      correctAnswer: 2,
      explanation: "Legitimate lotteries don't email winners out of the blue, especially if you didn't enter. This is a common scam to steal your banking information.",
      hint: "Think about whether you actually entered any lottery."
    },
    {
      level: 1,
      category: "Email Scams",
      question: "You receive an email from your bank asking you to click a link to verify your account information due to 'suspicious activity'. What is the safest action?",
      options: [
        "Click the link and provide the requested information",
        "Reply to the email with your account details",
        "Contact your bank directly using a phone number from their official website",
        "Forward the email to your family for their opinion"
      ],
      correctAnswer: 2,
      explanation: "Banks never ask for sensitive information via email. This is a phishing attempt. Always contact your bank through official channels.",
      hint: "Banks have specific policies about how they contact customers."
    },
    {
      level: 1,
      category: "Social Media Scams",
      question: "A friend sends you a message on social media with a link saying 'Is this you in this video?' What should you do?",
      options: [
        "Click the link to see the video",
        "Ask your friend if they actually sent the message",
        "Share the link with your other friends",
        "Report the message to the platform"
      ],
      correctAnswer: 1,
      explanation: "This could be a compromised account sending malicious links. Verify with your friend before clicking any suspicious links.",
      hint: "Consider whether the message seems normal for your friend."
    },
    {
      level: 1,
      category: "Shopping Scams",
      question: "You find an online store selling designer goods at 90% off retail price. The website looks professional but only accepts wire transfers. What should you do?",
      options: [
        "Take advantage of the great deal and wire the money",
        "Check if the website has customer reviews first",
        "Avoid purchasing as this is likely a scam",
        "Ask the seller for additional photos of the products"
      ],
      correctAnswer: 2,
      explanation: "Extremely low prices and requests for wire transfers are major red flags for counterfeit goods scams or complete frauds.",
      hint: "If a deal seems too good to be true, it probably is."
    },
    {
      level: 1,
      category: "Tech Support Scams",
      question: "You receive a pop-up message saying your computer is infected with a virus and provides a phone number to call for technical support. What should you do?",
      options: [
        "Call the number immediately to protect your computer",
        "Close the pop-up and run your own antivirus scan",
        "Click the 'Scan Now' button in the pop-up",
        "Shut down your computer to prevent damage"
      ],
      correctAnswer: 1,
      explanation: "These are fake alerts designed to trick you into paying for unnecessary 'support' or installing malware. Use your own trusted antivirus software.",
      hint: "Legitimate security companies don't use browser pop-ups for virus alerts."
    },
    
    // Level 2 - Intermediate Scams
    {
      level: 2,
      category: "Job Scams",
      question: "You're offered a work-from-home job with an unusually high salary for simple tasks. The employer sends you a check and asks you to wire a portion to a vendor for equipment. What is this likely to be?",
      options: [
        "A legitimate hiring practice for remote positions",
        "A standard probation period for new employees",
        "A fake check scam that will leave you owing money",
        "A tax-efficient payment method"
      ],
      correctAnswer: 2,
      explanation: "This is a common fake check scam. The check will bounce, but you'll have already sent real money to the scammer.",
      hint: "Think about why an employer would need you to handle their finances before you've started working."
    },
    {
      level: 2,
      category: "Romance Scams",
      question: "Someone you met online quickly professes their love but has never been able to meet in person. They now need money for a medical emergency. What should you do?",
      options: [
        "Send the money immediately to help your loved one",
        "Ask for more medical documentation before sending money",
        "Refuse to send money and report the profile",
        "Offer to contact the hospital directly to pay the bills"
      ],
      correctAnswer: 2,
      explanation: "This is a classic romance scam. Scammers build emotional connections to manipulate victims into sending money.",
      hint: "Consider why someone who loves you would put you in this position."
    },
    {
      level: 2,
      category: "Investment Scams",
      question: "You're contacted about an 'exclusive' investment opportunity with guaranteed high returns and little to no risk. What should you do?",
      options: [
        "Invest quickly before the opportunity closes",
        "Research the investment and company thoroughly",
        "Ask if you can start with a small investment",
        "Check if the investment is registered with financial authorities"
      ],
      correctAnswer: 3,
      explanation: "All legitimate investments carry some risk, and guaranteed high returns are a red flag. Always verify investments through regulatory authorities.",
      hint: "Remember the basic principle: higher returns usually come with higher risk."
    },
    {
      level: 2,
      category: "Impersonation Scams",
      question: "You receive a call from someone claiming to be from the IRS demanding immediate payment for back taxes and threatening arrest if you don't pay. What should you do?",
      options: [
        "Provide your payment information immediately",
        "Hang up and contact the IRS directly through official channels",
        "Ask to speak with a supervisor",
        "Negotiate a payment plan over the phone"
      ],
      correctAnswer: 1,
      explanation: "The IRS never makes threatening phone calls demanding immediate payment. This is a common impersonation scam.",
      hint: "Government agencies have specific procedures for contacting citizens about official matters."
    },
    {
      level: 2,
      category: "Rental Scams",
      question: "You find a rental apartment online at a great price. The 'landlord' says they're out of the country and asks for a security deposit and first month's rent via wire transfer to hold the property. What should you do?",
      options: [
        "Send the money quickly before someone else rents it",
        "Ask for a video tour of the property",
        "Refuse to send money without seeing the property in person",
        "Offer to pay through a secure rental platform"
      ],
      correctAnswer: 2,
      explanation: "Legitimate landlords will show properties in person or use reputable rental services. Wiring money to strangers is extremely risky.",
      hint: "Consider why a landlord would be unable to use standard rental procedures."
    },
    
    // Level 3 - Advanced Scams
    {
      level: 3,
      category: "Cryptocurrency Scams",
      question: "A celebrity endorses a new cryptocurrency on social media, and you're directed to a site to invest. The site promises to double your investment in 24 hours. What should you do?",
      options: [
        "Invest immediately to maximize returns",
        "Verify if the celebrity actually made this endorsement",
        "Invest a small amount to test the platform",
        "Avoid this as it's likely a scam"
      ],
      correctAnswer: 3,
      explanation: "Celebrity cryptocurrency endorsements are often faked, and promises of guaranteed high returns are classic scam indicators.",
      hint: "Legitimate investments don't guarantee specific returns, especially not extremely high ones in short periods."
    },
    {
      level: 3,
      category: "Identity Theft",
      question: "You receive an email from what appears to be a government agency requesting your Social Security number and other personal information to 'verify your identity' for a new benefits program. What should you do?",
      options: [
        "Provide the requested information to claim your benefits",
        "Call the agency using a number from their official website",
        "Reply asking for more details about the benefits program",
        "Forward the email to friends who might also be eligible"
      ],
      correctAnswer: 1,
      explanation: "Government agencies don't request sensitive information via email. This is likely an attempt to steal your identity.",
      hint: "Government agencies have specific protocols for collecting personal information."
    },
    {
      level: 3,
      category: "Tech Scams",
      question: "Your computer freezes and a message appears saying your files have been encrypted and you must pay a ransom in Bitcoin to get them back. What should you do?",
      options: [
        "Pay the ransom immediately to recover your files",
        "Disconnect from the internet and seek professional help",
        "Try to enter your password multiple times to unlock the files",
        "Restart your computer in safe mode"
      ],
      correctAnswer: 1,
      explanation: "This is ransomware. Paying doesn't guarantee you'll get your files back and funds criminal activities. Disconnect from the internet and consult professionals.",
      hint: "Consider who benefits from you paying this ransom."
    },
    {
      level: 3,
      category: "Financial Scams",
      question: "A financial advisor recommends moving your retirement funds into a special 'protected' account that promises higher returns and tax benefits. The advisor pressures you to decide quickly. What should you do?",
      options: [
        "Move the funds immediately to secure the higher returns",
        "Ask for all information in writing and consult an independent financial advisor",
        "Move a portion of your funds as a test",
        "Check if the advisor is licensed and the investment is registered"
      ],
      correctAnswer: 1,
      explanation: "High-pressure tactics and promises of special deals are red flags for financial scams. Always get independent advice before making major financial decisions.",
      hint: "Legitimate financial professionals encourage careful consideration of investments."
    },
    {
      level: 3,
      category: "Advanced Phishing",
      question: "You receive an email that appears to be from your company's IT department. It looks identical to previous IT communications and asks you to confirm your login credentials for a 'system update'. What should you do?",
      options: [
        "Provide your credentials as requested",
        "Contact the IT department through a known channel to verify the request",
        "Check the email's digital certificate first",
        "Reply asking for more details about the system update"
      ],
      correctAnswer: 1,
      explanation: "This could be a sophisticated spear phishing attack. Even if it looks legitimate, verify through a separate communication channel before providing any credentials.",
      hint: "Consider how your company normally handles credential requests."
    },
    
    // Level 4 - Expert Scams
    {
      level: 4,
      category: "Business Email Compromise",
      question: "You receive an email from your CEO asking you to urgently transfer funds to a new vendor for a confidential project. The email domain looks correct but is slightly different. What should you do?",
      options: [
        "Process the transfer immediately to maintain confidentiality",
        "Verify the request through a known communication channel",
        "Check if the vendor is in the approved vendor list",
        "Ask the CEO for additional project details"
      ],
      correctAnswer: 1,
      explanation: "This is likely a business email compromise scam. Always verify unusual financial requests through a separate communication method.",
      hint: "Pay attention to small details in email addresses and domains."
    },
    {
      level: 4,
      category: "Investment Fraud",
      question: "You're invited to join an exclusive investment club with members who have made extraordinary returns. To join, you must pay a membership fee and sign a non-disclosure agreement. What should you do?",
      options: [
        "Join quickly to start earning the high returns",
        "Research the club and verify members' claims independently",
        "Ask for a trial membership before paying",
        "Check if the club is registered with financial regulators"
      ],
      correctAnswer: 1,
      explanation: "Exclusive investment clubs with extraordinary returns and secrecy requirements are often Ponzi schemes or investment frauds.",
      hint: "Legitimate investments don't need secrecy or non-disclosure agreements."
    },
    {
      level: 4,
      category: "Advanced Identity Theft",
      question: "You're contacted by someone claiming to be from your bank's fraud department. They provide your full name, address, and partial account number, then ask you to verify your full account number and PIN. What should you do?",
      options: [
        "Provide the requested information to verify your identity",
        "Hang up and call your bank using the number on your card or statement",
        "Ask the caller to verify more information about you first",
        "Provide only your account number but not your PIN"
      ],
      correctAnswer: 1,
      explanation: "Scammers can obtain basic personal information from various sources. Banks never ask for your full account number or PIN over the phone.",
      hint: "Consider what information a legitimate bank would already have."
    },
    {
      level: 4,
      category: "Real Estate Scams",
      question: "You're selling your home and receive a full-price cash offer from a buyer who can't view the property in person. They send a cashier's check for more than the asking price and ask you to wire the excess to their 'moving company'. What should you do?",
      options: [
        "Deposit the check and wire the excess as requested",
        "Wait until the check fully clears before taking any action",
        "Return the check and ask for the correct amount",
        "Contact the bank that issued the cashier's check to verify it"
      ],
      correctAnswer: 1,
      explanation: "This is a fake check scam. Even cashier's checks can be forged, and banks may make funds available before the check actually clears.",
      hint: "Consider why a buyer would overpay and ask you to handle their finances."
    },
    {
      level: 4,
      category: "Tech Support Scams",
      question: "You receive a call from 'Microsoft Support' saying they've detected hackers on your computer. They direct you to a website that allows them to remotely access your computer to 'fix' the issue. What should you do?",
      options: [
        "Allow them remote access to secure your computer",
        "Ask for their employee ID and call Microsoft's official support number",
        "Ask them to guide you through fixing the issue yourself",
        "Run your own antivirus scan first"
      ],
      correctAnswer: 1,
      explanation: "Microsoft doesn't make unsolicited calls or request remote access to computers. This is a scam to install malware or steal information.",
      hint: "Consider how a legitimate company would handle security issues."
    },
    
    // Level 5 - Master Scams
    {
      level: 5,
      category: "Advanced Financial Scams",
      question: "You're approached about investing in a 'prime bank' instrument that offers guaranteed high returns and is only available to wealthy investors. The program involves complex financial instruments and offshore accounts. What should you do?",
      options: [
        "Invest to gain access to this exclusive opportunity",
        "Research the investment with independent financial experts",
        "Ask for a smaller initial investment to test the program",
        "Check if the program is registered with financial authorities"
      ],
      correctAnswer: 1,
      explanation: "Prime bank instruments are a common scam. Legitimate banking programs don't offer guaranteed high returns exclusively to 'wealthy investors'.",
      hint: "Complex financial jargon and exclusivity are often used to make scams seem legitimate."
    },
    {
      level: 5,
      category: "Identity Theft Rings",
      question: "You're offered a job where you receive packages at home, repackage them, and send them to other addresses. The pay is unusually high for simple work. What is this likely to be?",
      options: [
        "A legitimate logistics job with good pay",
        "A reshipping scam involving stolen goods",
        "A test for a potential management position",
        "A market research operation"
      ],
      correctAnswer: 1,
      explanation: "This is likely a reshipping scam where you're used as a middleman to fence stolen goods or launder money.",
      hint: "Consider why a company would pay high wages for such simple work."
    },
    {
      level: 5,
      category: "Advanced Romance Scams",
      question: "Someone you've been in an online relationship with for months plans to visit but needs you to handle travel expenses through their 'travel agent'. They promise to reimburse you upon arrival. What should you do?",
      options: [
        "Send the money to finally meet in person",
        "Suggest they use a reputable booking service you can pay directly",
        "Offer to meet them at their airport instead",
        "Ask for more verification of their identity"
      ],
      correctAnswer: 1,
      explanation: "This is a common romance scam tactic. The person likely has no intention of visiting and is just trying to get more money from you.",
      hint: "Consider why someone would need you to handle their travel arrangements."
    },
    {
      level: 5,
      category: "Corporate Espionage",
      question: "You receive a job offer that includes an unusually high salary and minimal responsibilities. The only requirement is that you provide access to your previous employer's client database. What should you do?",
      options: [
        "Accept the offer and provide the requested information",
        "Report the offer to your former employer's security department",
        "Provide anonymized data instead of the full database",
        "Negotiate for a higher salary before providing the data"
      ],
      correctAnswer: 1,
      explanation: "This is likely an attempt at corporate espionage. Providing confidential information from a former employer is illegal and unethical.",
      hint: "Consider why a company would pay so much for easily accessible information."
    },
    {
      level: 5,
      category: "Cryptocurrency Scams",
      question: "You're invited to participate in an initial coin offering (ICO) for a new cryptocurrency with revolutionary technology. The white paper is filled with technical jargon and promises to disrupt the industry. What should you do?",
      options: [
        "Invest early to maximize returns",
        "Have the white paper reviewed by independent blockchain experts",
        "Invest a small amount to minimize risk",
        "Check if the development team has verifiable credentials"
      ],
      correctAnswer: 1,
      explanation: "Many ICOs are scams with impressive white papers but no real technology or team. Independent expert review is essential.",
      hint: "Technical jargon is often used to make scams seem legitimate and complex."
    }
  ];

  // Filter questions by current level
  const levelQuestions = questions.filter(q => q.level === currentLevel);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && !showFeedback && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0 && !showFeedback) {
      handleAnswer(-1); // Time's up
    }
    return () => clearTimeout(timer);
  }, [gameState, showFeedback, timeLeft]);

  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (score >= 500 && !achievements.includes("Scam Novice")) {
      newAchievements.push("Scam Novice");
    }
    
    if (score >= 1000 && !achievements.includes("Scam Expert")) {
      newAchievements.push("Scam Expert");
    }
    
    if (score >= 2000 && !achievements.includes("Scam Master")) {
      newAchievements.push("Scam Master");
    }
    
    if (streak >= 5 && !achievements.includes("On Fire!")) {
      newAchievements.push("On Fire!");
    }
    
    if (currentLevel >= 3 && !achievements.includes("Level Climber")) {
      newAchievements.push("Level Climber");
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
    }
  }, [score, streak, currentLevel, achievements]);

  // Start the game
  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(30);
    setHints(3);
    setStreak(0);
    setAchievements([]);
  };

  // Handle answer selection
  const handleAnswer = (answerIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const question = levelQuestions[currentQuestion];
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      // Calculate points based on time left and level
      const points = Math.floor((timeLeft * 10) * currentLevel);
      setScore(score + points);
      setStreak(streak + 1);
      
      // Bonus points for streaks
      if (streak >= 3) {
        setScore(score + points + 50);
      }
    } else {
      setLives(lives - 1);
      setStreak(0);
      
      if (lives <= 1) {
        setTimeout(() => {
          setGameState('gameOver');
        }, 2000);
      }
    }
    
    // Move to next question or level
    setTimeout(() => {
      if (currentQuestion < levelQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(30);
        setShowHint(false);
      } else {
        // Level complete
        if (currentLevel < 5) {
          setGameState('levelComplete');
        } else {
          // Game completed
          setGameState('gameOver');
        }
      }
    }, 3000);
  };

  // Use hint
  const useHint = () => {
    if (hints > 0 && !showFeedback) {
      setHints(hints - 1);
      setShowHint(true);
    }
  };

  // Next level
  const nextLevel = () => {
    setCurrentLevel(currentLevel + 1);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(30);
    setGameState('playing');
    setShowHint(false);
  };

  // Restart game
  const restartGame = () => {
    startGame();
  };

  // Add to leaderboard
  const addToLeaderboard = () => {
    if (playerName.trim() !== "") {
      const newEntry = { name: playerName, score };
      const newLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setLeaderboard(newLeaderboard);
      setGameState('start');
    }
  };

  // Render game based on state
  const renderGame = () => {
    switch (gameState) {
      case 'start':
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50/30 to-purple-100/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-center text-indigo-300 mb-6">Scam Buster Game</h1>
            <div className="bg-blue-100 p-8 rounded-xl shadow-lg mb-8 w-full">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">How to Play</h2>
              <ul className="space-y-3 text-black mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Answer questions to identify and avoid online scams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Each correct answer earns points based on time and difficulty</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>You have 3 lives - lose one for each wrong answer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Use hints wisely - you only get 3 per game</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Build streaks for bonus points!</span>
                </li>
              </ul>
              <div className="flex justify-center">
                <button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Game
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg w-full">
              <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Top Players</h3>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-indigo-600 mr-3">#{index + 1}</span>
                      <span className="font-medium text-gray-800">{player.name}</span>
                    </div>
                    <span className="font-bold text-indigo-600">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'playing':
        { const question = levelQuestions[currentQuestion];
        return (
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50/60 to-purple-100/60 rounded-2xl shadow-xl max-w-3xl mx-auto">
            {/* Game stats */}
            <div className="flex justify-between w-full mb-6">
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-gray-600 mr-2">Score:</span>
                <span className="font-bold text-indigo-600">{score}</span>
              </div>
              
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-gray-600 mr-2">Level:</span>
                <span className="font-bold text-indigo-600">{currentLevel}/5</span>
              </div>
              
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-gray-600 mr-2">Lives:</span>
                <div className="flex">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className={`mx-1 ${i < lives ? 'text-red-500' : 'text-gray-300'}`}>❤️</span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-gray-600 mr-2">Time:</span>
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-indigo-600'}`}>{timeLeft}s</span>
              </div>
            </div>
            
            {/* Streak indicator */}
            {streak >= 3 && (
              <div className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full animate-pulse">
                <span className="font-bold">🔥 {streak} Streak! 🔥</span>
              </div>
            )}
            
            {/* Question card */}
            <div className="bg-white p-6 rounded-xl shadow-lg w-full mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                  {question.category}
                </span>
                <span className="text-gray-500 text-sm">
                  Question {currentQuestion + 1} of {levelQuestions.length}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h3>
              
              {showHint && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Hint:</strong> {question.hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showFeedback}
                    className={`cursor-pointer w-full text-left p-4 rounded-lg transition-all ${
                      showFeedback
                        ? index === question.correctAnswer
                          ? 'bg-green-100 border-2 border-green-500'
                          : selectedAnswer === index
                            ? 'bg-red-100 border-2 border-red-500'
                            : 'bg-gray-100'
                        : 'bg-gray-100 hover:bg-indigo-100 hover:border-indigo-300 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-black bg-gray-200 mr-3">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-800">{option}</span>
                      {showFeedback && index === question.correctAnswer && (
                        <span className="ml-auto text-green-500">✓</span>
                      )}
                      {showFeedback && selectedAnswer === index && index !== question.correctAnswer && (
                        <span className="ml-auto text-red-500">✗</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={useHint}
                  disabled={hints === 0 || showFeedback}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    hints === 0 || showFeedback
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  💡 Hint ({hints})
                </button>
                
                <button
                  onClick={() => setGameState('start')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Quit Game
                </button>
              </div>
            </div>
            
            {/* Feedback */}
            {showFeedback && (
              <div className={`w-full p-4 rounded-lg shadow-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </h3>
                    <div className={`mt-2 text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {question.explanation}
                    </div>
                    {isCorrect && (
                      <div className="mt-2 text-sm font-medium text-green-700">
                        +{Math.floor((timeLeft * 10) * currentLevel)} points
                        {streak >= 3 && ' +50 streak bonus!'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mt-4 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Achievements Unlocked:</h3>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => (
                    <span key={index} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                      🏆 {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ); }
        
      case 'levelComplete':
        return (
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-xl max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-indigo-800 mb-4">Level {currentLevel} Complete!</h2>
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl text-gray-700 mb-6">You've mastered this level of scam detection!</p>
              
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Current Score:</span>
                  <span className="font-bold text-indigo-600">{score}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Lives Remaining:</span>
                  <div className="flex">
                    {[...Array(3)].map((_, i) => (
                      <span key={i} className={`mx-1 ${i < lives ? 'text-red-500' : 'text-gray-300'}`}>❤️</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hints Remaining:</span>
                  <span className="font-bold text-indigo-600">{hints}</span>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={nextLevel}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Level {currentLevel + 1} →
                </button>
                
                <button
                  onClick={() => setGameState('start')}
                  className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-300 transition-all"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'gameOver':
        return (
          <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-xl max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-indigo-800 mb-4">Game Over!</h2>
              <div className="text-6xl mb-4">😢</div>
              <p className="text-xl text-gray-700 mb-2">Your final score:</p>
              <p className="text-5xl font-bold text-indigo-600 mb-6">{score}</p>
              
              {score >= 1000 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-6 inline-block">
                  <span className="font-bold">🏆 Scam Expert! 🏆</span>
                </div>
              )}
              
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Enter your name for the leaderboard:</h3>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />
                <button
                  onClick={addToLeaderboard}
                  disabled={!playerName.trim()}
                  className={`w-full py-3 rounded-lg font-bold ${
                    playerName.trim()
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Score
                </button>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
                
                <button
                  onClick={() => setGameState('start')}
                  className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-300 transition-all"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {renderGame()}
    </div>
  );
};

export default ScamBusterGame;