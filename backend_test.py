
import requests
import unittest
import sys
import json
from datetime import datetime

class AICollaborationPlatformAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(AICollaborationPlatformAPITest, self).__init__(*args, **kwargs)
        self.base_url = "http://localhost:8002"
        self.api_prefix = "/api"
        
    def get_url(self, endpoint):
        """Construct full URL with API prefix"""
        return f"{self.base_url}{self.api_prefix}{endpoint}"
    
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(self.get_url("/health"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check endpoint working")
        
    def test_02_get_messages(self):
        """Test getting all messages"""
        print("\n🔍 Testing get messages endpoint...")
        response = requests.get(self.get_url("/messages"))
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        print("✅ Get messages endpoint working")
        
    def test_03_create_message(self):
        """Test creating a new message"""
        print("\n🔍 Testing create message endpoint...")
        test_content = f"Test message {datetime.now().isoformat()}"
        test_sender = "API Test"
        
        response = requests.post(
            self.get_url("/messages"), 
            params={"content": test_content, "sender": test_sender}
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["content"], test_content)
        self.assertEqual(data["sender"], test_sender)
        self.assertIn("id", data)
        print("✅ Create message endpoint working")
        
    def test_04_get_files(self):
        """Test getting all files"""
        print("\n🔍 Testing get files endpoint...")
        response = requests.get(self.get_url("/files"))
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
        print("✅ Get files endpoint working")
        
    def test_05_create_file(self):
        """Test creating a new file"""
        print("\n🔍 Testing create file endpoint...")
        test_name = f"test_file_{datetime.now().strftime('%H%M%S')}.js"
        test_content = "console.log('Hello from test file');"
        test_type = "javascript"
        
        response = requests.post(
            self.get_url("/files"), 
            params={"name": test_name, "content": test_content, "type": test_type}
        )
        
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["name"], test_name)
        self.assertEqual(data["content"], test_content)
        self.assertEqual(data["type"], test_type)
        self.assertIn("id", data)
        
        # Save file ID for next test
        self.file_id = data["id"]
        print("✅ Create file endpoint working")
        
    def test_06_get_file_by_id(self):
        """Test getting a specific file by ID"""
        print("\n🔍 Testing get file by ID endpoint...")
        # Skip if previous test didn't create a file
        if not hasattr(self, 'file_id'):
            self.skipTest("No file ID available from previous test")
            
        response = requests.get(self.get_url(f"/files/{self.file_id}"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.file_id)
        print("✅ Get file by ID endpoint working")
        
    def test_07_get_nonexistent_file(self):
        """Test getting a file that doesn't exist"""
        print("\n🔍 Testing get nonexistent file endpoint...")
        fake_id = "nonexistent-id"
        response = requests.get(self.get_url(f"/files/{fake_id}"))
        self.assertEqual(response.status_code, 404)
        print("✅ Get nonexistent file returns 404 as expected")

def run_tests():
    """Run the API tests"""
    test_suite = unittest.TestLoader().loadTestsFromTestCase(AICollaborationPlatformAPITest)
    test_result = unittest.TextTestRunner(verbosity=2).run(test_suite)
    return test_result.wasSuccessful()

if __name__ == "__main__":
    print("🚀 Starting AI Collaboration Platform API Tests")
    success = run_tests()
    print("\n📊 Test Summary:")
    if success:
        print("✅ All API tests passed successfully!")
        sys.exit(0)
    else:
        print("❌ Some API tests failed!")
        sys.exit(1)
