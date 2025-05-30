// Test script to verify AI Code-to-File Integration
// This tests the OpenAI API directly to confirm it's working

const OPENAI_API_KEY = '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';

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI API Integration...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Create a simple HTML page with CSS styling. Provide the code in proper code blocks.'
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API Response received!');
    console.log('📝 Response:', data.choices[0].message.content.substring(0, 200) + '...');
    
    // Check if response contains code blocks
    const hasCodeBlocks = data.choices[0].message.content.includes('```');
    console.log(`🔍 Contains code blocks: ${hasCodeBlocks ? '✅ YES' : '❌ NO'}`);
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    return false;
  }
}

async function testBackendHealth() {
  console.log('🏥 Testing Backend Health...');
  
  try {
    const response = await fetch('http://localhost:8001/api/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Backend Health:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Code-to-File Integration Tests...\n');
  
  const backendOk = await testBackendHealth();
  const openaiOk = await testOpenAIIntegration();
  
  console.log('\n📊 Test Results:');
  console.log(`Backend API: ${backendOk ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`OpenAI API: ${openaiOk ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (backendOk && openaiOk) {
    console.log('\n🎉 SUCCESS: Core APIs are working! AI code-to-file integration should be functional.');
    console.log('📋 Next steps:');
    console.log('1. Load http://localhost:5174/ in browser');
    console.log('2. Use AI chat (press Enter to send)');
    console.log('3. Try prompt: "Create a responsive website with HTML, CSS, and JavaScript"');
    console.log('4. Check if files are created in file tree');
  } else {
    console.log('\n💥 FAILURE: Critical APIs not working. Need to fix configuration.');
  }
}

runTests();
