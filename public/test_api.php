<?php

/**
 * MarketFollowers API Test Script
 * 
 * This script demonstrates how to use the MarketFollowers API wrapper class.
 * Make sure you have configured your API key in config/api.php before running this script.
 */

// Include the API class
require_once __DIR__ . '/../src/Api.php';

// Load configuration
$config = require __DIR__ . '/../config/api.php';

// Set content type for web browsers
if (!isset($_SERVER['HTTP_HOST'])) {
    // Running from command line
    echo "MarketFollowers API Test Script\n";
    echo "==============================\n\n";
} else {
    // Running from web browser
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MarketFollowers API Test - Followers.cl</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1, h2 { color: #333; }
            .test-section { margin: 20px 0; padding: 15px; border-left: 4px solid #007cba; background-color: #f8f9fa; }
            .success { color: #28a745; background-color: #d4edda; border-color: #28a745; }
            .error { color: #dc3545; background-color: #f8d7da; border-color: #dc3545; }
            .warning { color: #856404; background-color: #fff3cd; border-color: #ffc107; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
            .code { font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 MarketFollowers API Test - Followers.cl</h1>';
}

/**
 * Helper function to display test results
 */
function displayTestResult($testName, $result, $error = null) {
    if (!isset($_SERVER['HTTP_HOST'])) {
        // Command line output
        echo "=== $testName ===\n";
        if ($error) {
            echo "❌ ERROR: $error\n";
        } else {
            echo "✅ SUCCESS\n";
            echo json_encode($result, JSON_PRETTY_PRINT) . "\n";
        }
        echo "\n";
    } else {
        // Web browser output
        $class = $error ? 'error' : 'success';
        $icon = $error ? '❌' : '✅';
        echo "<div class='test-section $class'>";
        echo "<h3>$icon $testName</h3>";
        if ($error) {
            echo "<p><strong>Error:</strong> " . htmlspecialchars($error) . "</p>";
        } else {
            echo "<p><strong>Success!</strong> Test completed successfully.</p>";
            echo "<pre>" . htmlspecialchars(json_encode($result, JSON_PRETTY_PRINT)) . "</pre>";
        }
        echo "</div>";
    }
}

/**
 * Helper function to display warnings
 */
function displayWarning($message) {
    if (!isset($_SERVER['HTTP_HOST'])) {
        echo "⚠️  WARNING: $message\n\n";
    } else {
        echo "<div class='test-section warning'>";
        echo "<h3>⚠️ Warning</h3>";
        echo "<p>" . htmlspecialchars($message) . "</p>";
        echo "</div>";
    }
}

try {
    // Check if API key is configured
    if ($config['marketfollowers']['api_key'] === 'TU_API_KEY_AQUI') {
        displayWarning('API key not configured! Please update config/api.php with your actual MarketFollowers API key.');
        
        if (!isset($_SERVER['HTTP_HOST'])) {
            echo "To configure the API:\n";
            echo "1. Edit config/api.php\n";
            echo "2. Replace 'TU_API_KEY_AQUI' with your actual API key\n";
            echo "3. Run this script again\n\n";
        } else {
            echo "<div class='test-section warning'>";
            echo "<h3>📝 Configuration Instructions</h3>";
            echo "<ol>";
            echo "<li>Edit <code>config/api.php</code></li>";
            echo "<li>Replace <code>'TU_API_KEY_AQUI'</code> with your actual API key</li>";
            echo "<li>Refresh this page to run the tests</li>";
            echo "</ol>";
            echo "</div>";
        }
        
        // Still create the API instance for demonstration purposes
        $api = new MarketFollowersApi('demo_key_not_configured', $config['marketfollowers']['base_url']);
    } else {
        // Initialize API with configured settings
        $api = new MarketFollowersApi(
            $config['marketfollowers']['api_key'],
            $config['marketfollowers']['base_url'],
            $config['marketfollowers']['timeout']
        );
    }

    // Test 1: API Status Check
    try {
        $status = $api->getApiStatus();
        displayTestResult('API Connectivity Test', $status);
    } catch (Exception $e) {
        displayTestResult('API Connectivity Test', null, $e->getMessage());
    }

    // Only run other tests if API key is properly configured
    if ($config['marketfollowers']['api_key'] !== 'TU_API_KEY_AQUI') {
        
        // Test 2: Get Account Balance
        try {
            $balance = $api->getBalance();
            displayTestResult('Account Balance Check', $balance);
        } catch (Exception $e) {
            displayTestResult('Account Balance Check', null, $e->getMessage());
        }

        // Test 3: Get Available Services
        try {
            $services = $api->getServices();
            displayTestResult('Available Services', [
                'total_services' => isset($services['services']) ? count($services['services']) : 0,
                'sample_services' => isset($services['services']) ? array_slice($services['services'], 0, 3) : []
            ]);
        } catch (Exception $e) {
            displayTestResult('Available Services', null, $e->getMessage());
        }

        // Test 4: Get Instagram Followers Services
        try {
            $followersServices = $api->getServicesByCategory('followers');
            displayTestResult('Instagram Followers Services', [
                'followers_services_count' => count($followersServices),
                'sample_services' => array_slice($followersServices, 0, 2)
            ]);
        } catch (Exception $e) {
            displayTestResult('Instagram Followers Services', null, $e->getMessage());
        }

        // Test 5: URL Validation
        $testUrls = [
            'https://instagram.com/followers.cl' => true,
            'https://www.instagram.com/test_user/' => true,
            'https://facebook.com/test' => false,
            'invalid-url' => false
        ];

        foreach ($testUrls as $url => $expected) {
            $isValid = $api->validateInstagramUrl($url);
            $result = $isValid === $expected ? 'PASS' : 'FAIL';
            displayTestResult("URL Validation: $url", [
                'url' => $url,
                'expected' => $expected ? 'valid' : 'invalid',
                'actual' => $isValid ? 'valid' : 'invalid',
                'test_result' => $result
            ]);
        }

        // Test 6: Order History (safe read-only operation)
        try {
            $history = $api->getOrderHistory(5, 0); // Get last 5 orders
            displayTestResult('Order History', [
                'orders_retrieved' => isset($history['orders']) ? count($history['orders']) : 0,
                'sample_data' => $history
            ]);
        } catch (Exception $e) {
            displayTestResult('Order History', null, $e->getMessage());
        }

    } else {
        if (!isset($_SERVER['HTTP_HOST'])) {
            echo "Skipping API tests - please configure your API key first.\n";
        } else {
            echo "<div class='test-section warning'>";
            echo "<h3>⏭️ Tests Skipped</h3>";
            echo "<p>API tests were skipped because the API key is not configured. Please update your configuration and refresh the page.</p>";
            echo "</div>";
        }
    }

    // Class and configuration information
    if (!isset($_SERVER['HTTP_HOST'])) {
        echo "=== Configuration Info ===\n";
        echo "API Base URL: " . $config['marketfollowers']['base_url'] . "\n";
        echo "Timeout: " . $config['marketfollowers']['timeout'] . " seconds\n";
        echo "Environment: " . $config['app']['environment'] . "\n";
    } else {
        echo "<div class='test-section'>";
        echo "<h3>ℹ️ Configuration Information</h3>";
        echo "<ul>";
        echo "<li><strong>API Base URL:</strong> " . htmlspecialchars($config['marketfollowers']['base_url']) . "</li>";
        echo "<li><strong>Timeout:</strong> " . $config['marketfollowers']['timeout'] . " seconds</li>";
        echo "<li><strong>Environment:</strong> " . htmlspecialchars($config['app']['environment']) . "</li>";
        echo "<li><strong>API Key:</strong> " . (strlen($config['marketfollowers']['api_key']) > 10 ? 'Configured ✅' : 'Not configured ❌') . "</li>";
        echo "</ul>";
        echo "</div>";
    }

} catch (Exception $e) {
    displayTestResult('API Initialization', null, $e->getMessage());
}

if (isset($_SERVER['HTTP_HOST'])) {
    echo '</div></body></html>';
}

// End of script
if (!isset($_SERVER['HTTP_HOST'])) {
    echo "Test script completed.\n";
}