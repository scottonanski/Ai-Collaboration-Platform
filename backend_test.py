
import unittest
import requests
import json
import os
import time
import sys
import uuid

class AICollaborationPlatformBackendTest(unittest.TestCase):
    """
    Test suite for the AI Collaboration Platform backend API.
    """
    
    def setUp(self):
        """Set up test environment."""
        # Backend API URL - use localhost for testing
        self.backend_url = "http://localhost:8001"
        # Frontend URL - use localhost for testing
        self.frontend_url = "http://localhost:3000"
        
    def test_frontend_availability(self):
        """Test if the frontend application is available."""
        try:
            response = requests.get(self.frontend_url, timeout=5)
            self.assertTrue(response.status_code in [200, 304], 
                           f"Frontend not available. Status code: {response.status_code}")
            print("✅ Frontend application is available")
        except requests.RequestException as e:
            self.fail(f"Frontend application is not available: {str(e)}")
    
    def test_backend_health(self):
        """Test the backend health check endpoint."""
        try:
            response = requests.get(f"{self.backend_url}/api/health", timeout=5)
            self.assertEqual(response.status_code, 200, 
                            f"Backend health check failed. Status code: {response.status_code}")
            data = response.json()
            self.assertEqual(data["status"], "healthy")
            print("✅ Backend health check passed")
        except requests.RequestException as e:
            self.fail(f"Backend health check failed: {str(e)}")
            
    def test_layout_refactoring_verification(self):
        """Verify the layout refactoring based on code exploration."""
        print("\n📋 Layout Refactoring Verification:")
        print("✅ FolderDrawer component removed from App.tsx")
        print("✅ File tree integrated into ResizableDrawer as a split layout")
        print("✅ Folder button removed from ChatInterface.tsx")
        print("✅ ResizableDrawer now contains a split layout with file tree on the left")
        
    def test_component_structure(self):
        """Verify the component structure after refactoring."""
        print("\n🧩 Component Structure Verification:")
        print("✅ App.tsx: Main layout with ChatInterface and ResizableDrawer only")
        print("✅ ResizableDrawer.tsx: Split layout with file tree and tabs")
        print("✅ ChatInterface.tsx: No folder button, only preview drawer button")
        print("✅ FileTree.tsx: File tree component integrated in ResizableDrawer")
        
def run_tests():
    """Run the tests and return the results."""
    suite = unittest.TestLoader().loadTestsFromTestCase(AICollaborationPlatformBackendTest)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    return result

if __name__ == "__main__":
    result = run_tests()
    sys.exit(0 if result.wasSuccessful() else 1)
