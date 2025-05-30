
import requests
import sys
import json
from datetime import datetime

class APITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_files(self):
        """Test getting the list of files"""
        success, response = self.run_test(
            "Get Files",
            "GET",
            "api/files",
            200
        )
        return success, response
    
    def test_get_file_content(self, filename):
        """Test getting file content"""
        success, response = self.run_test(
            f"Get File Content: {filename}",
            "GET",
            f"api/files/{filename}",
            200
        )
        return success, response
    
    def test_create_file(self, filename, content):
        """Test creating a file"""
        success, response = self.run_test(
            f"Create File: {filename}",
            "POST",
            "api/files",
            201,
            data={"filename": filename, "content": content}
        )
        return success, response
    
    def test_update_file(self, filename, content):
        """Test updating a file"""
        success, response = self.run_test(
            f"Update File: {filename}",
            "PUT",
            f"api/files/{filename}",
            200,
            data={"content": content}
        )
        return success, response
    
    def test_delete_file(self, filename):
        """Test deleting a file"""
        success, response = self.run_test(
            f"Delete File: {filename}",
            "DELETE",
            f"api/files/{filename}",
            200
        )
        return success, response

def main():
    # Setup
    tester = APITester()
    test_timestamp = datetime.now().strftime('%H%M%S')
    test_filename = f"test_file_{test_timestamp}.html"
    test_content = f"<html><body><h1>Test File {test_timestamp}</h1></body></html>"
    updated_content = f"<html><body><h1>Updated Test File {test_timestamp}</h1></body></html>"
    
    # Run tests
    print("\n🧪 Starting API Tests for AI Collaboration Platform")
    
    # Test 1: Get files
    get_files_success, files_response = tester.test_get_files()
    if not get_files_success:
        print("❌ Get files test failed, stopping tests")
        return 1
    
    print(f"📁 Files found: {len(files_response)}")
    
    # Test 2: Create a file
    create_success, create_response = tester.test_create_file(test_filename, test_content)
    if not create_success:
        print("❌ File creation failed, stopping tests")
        return 1
    
    # Test 3: Get file content
    get_content_success, content_response = tester.test_get_file_content(test_filename)
    if not get_content_success:
        print("❌ Get file content failed, stopping tests")
        return 1
    
    # Test 4: Update file
    update_success, update_response = tester.test_update_file(test_filename, updated_content)
    if not update_success:
        print("❌ File update failed, stopping tests")
        return 1
    
    # Test 5: Delete file
    delete_success, delete_response = tester.test_delete_file(test_filename)
    if not delete_success:
        print("❌ File deletion failed, stopping tests")
        return 1
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
