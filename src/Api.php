<?php

/**
 * MarketFollowers API Wrapper Class
 * 
 * This class provides a secure way to interact with the MarketFollowers API
 * for managing Instagram followers, likes, comments and other social media services.
 */
class MarketFollowersApi
{
    private $apiKey;
    private $baseUrl;
    private $timeout;

    /**
     * Constructor
     *
     * @param string $apiKey The API key for MarketFollowers
     * @param string $baseUrl The base URL for the API (default: production URL)
     * @param int $timeout Request timeout in seconds
     */
    public function __construct($apiKey, $baseUrl = 'https://api.marketfollowers.com/v1', $timeout = 30)
    {
        if (empty($apiKey)) {
            throw new InvalidArgumentException('API key is required');
        }
        
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->timeout = $timeout;
    }

    /**
     * Make HTTP request to the API
     *
     * @param string $endpoint
     * @param string $method
     * @param array $data
     * @return array
     * @throws Exception
     */
    private function makeRequest($endpoint, $method = 'GET', $data = [])
    {
        $url = $this->baseUrl . '/' . ltrim($endpoint, '/');
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'Accept: application/json',
            'User-Agent: FollowersCL/1.0'
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception('cURL Error: ' . $error);
        }

        $decodedResponse = json_decode($response, true);
        
        if ($httpCode >= 400) {
            $errorMessage = isset($decodedResponse['message']) 
                ? $decodedResponse['message'] 
                : 'HTTP Error ' . $httpCode;
            throw new Exception($errorMessage, $httpCode);
        }

        return $decodedResponse;
    }

    /**
     * Get account balance and information
     *
     * @return array
     */
    public function getBalance()
    {
        return $this->makeRequest('/account/balance');
    }

    /**
     * Get available services
     *
     * @return array
     */
    public function getServices()
    {
        return $this->makeRequest('/services');
    }

    /**
     * Create a new order
     *
     * @param int $service Service ID
     * @param string $link Instagram profile or post URL
     * @param int $quantity Number of followers/likes/comments
     * @return array
     */
    public function createOrder($service, $link, $quantity)
    {
        $data = [
            'service' => $service,
            'link' => $link,
            'quantity' => $quantity
        ];

        return $this->makeRequest('/order', 'POST', $data);
    }

    /**
     * Get order status
     *
     * @param int $orderId
     * @return array
     */
    public function getOrderStatus($orderId)
    {
        return $this->makeRequest('/order/status/' . $orderId);
    }

    /**
     * Get multiple order statuses
     *
     * @param array $orderIds
     * @return array
     */
    public function getMultipleOrderStatus($orderIds)
    {
        $data = ['orders' => implode(',', $orderIds)];
        return $this->makeRequest('/order/status', 'POST', $data);
    }

    /**
     * Cancel an order (if possible)
     *
     * @param int $orderId
     * @return array
     */
    public function cancelOrder($orderId)
    {
        return $this->makeRequest('/order/cancel/' . $orderId, 'POST');
    }

    /**
     * Get order history
     *
     * @param int $limit Number of orders to retrieve (default: 100, max: 10000)
     * @param int $offset Offset for pagination
     * @return array
     */
    public function getOrderHistory($limit = 100, $offset = 0)
    {
        $endpoint = '/orders?limit=' . $limit . '&offset=' . $offset;
        return $this->makeRequest($endpoint);
    }

    /**
     * Refill an order (add more quantity to existing order)
     *
     * @param int $orderId
     * @return array
     */
    public function refillOrder($orderId)
    {
        return $this->makeRequest('/order/refill/' . $orderId, 'POST');
    }

    /**
     * Get refill status
     *
     * @param int $refillId
     * @return array
     */
    public function getRefillStatus($refillId)
    {
        return $this->makeRequest('/refill/status/' . $refillId);
    }

    /**
     * Get service by category (followers, likes, comments, etc.)
     *
     * @param string $category
     * @return array
     */
    public function getServicesByCategory($category)
    {
        $services = $this->getServices();
        
        if (!isset($services['services'])) {
            return [];
        }

        return array_filter($services['services'], function($service) use ($category) {
            return stripos($service['name'], $category) !== false || 
                   stripos($service['category'], $category) !== false;
        });
    }

    /**
     * Validate Instagram URL
     *
     * @param string $url
     * @return bool
     */
    public function validateInstagramUrl($url)
    {
        $pattern = '/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?/';
        return preg_match($pattern, $url);
    }

    /**
     * Get API status and connectivity
     *
     * @return array
     */
    public function getApiStatus()
    {
        try {
            $response = $this->makeRequest('/status');
            return [
                'status' => 'connected',
                'response' => $response
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => $e->getCode()
            ];
        }
    }
}