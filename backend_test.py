import requests
import unittest
import uuid
import json
from datetime import datetime

class AICollaborationPlatformAPITest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.base_url = "http://localhost:8001"  # Using the backend URL from the environment
        self.api_prefix = "/api"
        print(f"Using backend URL: {self.base_url}{self.api_prefix}")
        
    def get_url(self, endpoint):
        """Helper to construct API URLs with the proper prefix"""
        return f"{self.base_url}{self.api_prefix}/{endpoint}"
    
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(self.get_url("health"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        print("✅ Health check passed")
        
    def test_02_get_messages(self):
        """Test retrieving messages"""
        print("\n🔍 Testing get messages endpoint...")
        response = requests.get(self.get_url("messages"))
        self.assertEqual(response.status_code, 200)
        messages = response.json()
        self.assertIsInstance(messages, list)
        print(f"✅ Retrieved {len(messages)} messages")
        
    def test_03_create_message(self):
        """Test creating a new message"""
        print("\n🔍 Testing create message endpoint...")
        test_content = f"Test message {uuid.uuid4()}"
        test_sender = "test_user"
        
        response = requests.post(
            self.get_url("messages"), 
            params={"content": test_content, "sender": test_sender}
        )
        
        self.assertEqual(response.status_code, 201)
        message = response.json()
        self.assertEqual(message["content"], test_content)
        self.assertEqual(message["sender"], test_sender)
        print(f"✅ Created message with ID: {message['id']}")
        
    def test_04_get_files(self):
        """Test retrieving files"""
        print("\n🔍 Testing get files endpoint...")
        response = requests.get(self.get_url("files"))
        self.assertEqual(response.status_code, 200)
        files = response.json()
        self.assertIsInstance(files, list)
        print(f"✅ Retrieved {len(files)} files")
        
    def test_05_create_file(self):
        """Test creating a new file"""
        print("\n🔍 Testing create file endpoint...")
        test_name = f"test_file_{uuid.uuid4()}.html"
        test_content = "<html><body><h1>Test File</h1></body></html>"
        test_type = "html"
        
        response = requests.post(
            self.get_url("files"), 
            params={"name": test_name, "content": test_content, "type": test_type}
        )
        
        self.assertEqual(response.status_code, 201)
        file = response.json()
        self.assertEqual(file["name"], test_name)
        self.assertEqual(file["content"], test_content)
        self.assertEqual(file["type"], test_type)
        
        # Save the file ID for the next test
        self.test_file_id = file["id"]
        print(f"✅ Created file with ID: {file['id']}")
        
    def test_06_get_file_by_id(self):
        """Test retrieving a specific file by ID"""
        print("\n🔍 Testing get file by ID endpoint...")
        # Make sure we have a file ID from the previous test
        if not hasattr(self, 'test_file_id'):
            self.test_05_create_file()
            
        response = requests.get(self.get_url(f"files/{self.test_file_id}"))
        self.assertEqual(response.status_code, 200)
        file = response.json()
        self.assertEqual(file["id"], self.test_file_id)
        print(f"✅ Retrieved file: {file['name']}")
        
    def test_07_get_nonexistent_file(self):
        """Test retrieving a file that doesn't exist"""
        print("\n🔍 Testing get nonexistent file...")
        fake_id = str(uuid.uuid4())
        response = requests.get(self.get_url(f"files/{fake_id}"))
        self.assertEqual(response.status_code, 404)
        print("✅ Correctly returned 404 for nonexistent file")

def run_tests():
    """Run all the API tests"""
    print("🚀 Starting API Tests for AI Collaboration Platform")
    test_suite = unittest.TestSuite()
    test_suite.addTest(AICollaborationPlatformAPITest('test_01_health_check'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_02_get_messages'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_03_create_message'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_04_get_files'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_05_create_file'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_06_get_file_by_id'))
    test_suite.addTest(AICollaborationPlatformAPITest('test_07_get_nonexistent_file'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    print("\n📊 Test Summary:")
    print(f"✅ Passed: {result.testsRun - len(result.errors) - len(result.failures)}")
    print(f"❌ Failed: {len(result.failures)}")
    print(f"⚠️ Errors: {len(result.errors)}")
    
    return len(result.failures) + len(result.errors) == 0

if __name__ == "__main__":
    run_tests()
