# followers.cl
Plataforma de venta de seguidores de Instagram con integración de MarketFollowers API

## 🚀 Características

- Interfaz web moderna y responsiva para servicios de Instagram
- Integración segura con la API de MarketFollowers
- Sistema de carrito de compras
- Integración con Mercado Pago para pagos
- API wrapper en PHP para manejo seguro de credenciales

## 📋 Requisitos

- PHP 7.4+ con cURL habilitado
- Servidor web (Apache/Nginx) para ejecutar scripts PHP
- Cuenta en MarketFollowers con API key válida

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/pankxo/followers.cl.git
cd followers.cl
```

### 2. Configurar la API de MarketFollowers

#### ⚠️ IMPORTANTE: Configuración de Seguridad

La API key de MarketFollowers debe mantenerse **estrictamente privada** y nunca debe ser expuesta en archivos públicos o repositorios.

1. **Editar el archivo de configuración:**
   ```bash
   cp config/api.php config/api.php.backup  # Crear respaldo si es necesario
   nano config/api.php  # O usar tu editor preferido
   ```

2. **Reemplazar la API key:**
   ```php
   // En config/api.php
   'api_key' => 'TU_API_KEY_REAL_AQUI',  // ⬅️ Cambiar esta línea
   ```

3. **Obtener tu API key:**
   - Visita https://marketfollowers.com/api
   - Inicia sesión en tu cuenta
   - Copia tu API key desde el panel de control

4. **Verificar que config/api.php esté en .gitignore:**
   El archivo ya está configurado para ser ignorado por Git, pero verifica:
   ```bash
   cat .gitignore | grep config/api.php
   ```

### 3. Configurar Servidor Web

#### Para Apache:
Asegúrate de que el DocumentRoot apunte al directorio del proyecto y que PHP esté habilitado.

#### Para desarrollo local con PHP:
```bash
php -S localhost:8000
```

## 🧪 Pruebas y Verificación

### Probar la Integración API

1. **Ejecutar desde navegador web:**
   ```
   http://localhost:8000/public/test_api.php
   ```

2. **Ejecutar desde línea de comandos:**
   ```bash
   php public/test_api.php
   ```

### Qué Verifica el Script de Prueba:

- ✅ Conectividad con la API de MarketFollowers
- ✅ Validación de credenciales
- ✅ Consulta de balance de cuenta
- ✅ Listado de servicios disponibles
- ✅ Filtrado de servicios por categoría
- ✅ Validación de URLs de Instagram
- ✅ Historial de órdenes

## 📚 Uso de la API

### Ejemplo Básico

```php
<?php
// Cargar configuración
$config = require 'config/api.php';

// Incluir la clase API
require_once 'src/Api.php';

// Inicializar API
$api = new MarketFollowersApi(
    $config['marketfollowers']['api_key'],
    $config['marketfollowers']['base_url']
);

// Obtener servicios disponibles
try {
    $services = $api->getServices();
    echo "Servicios disponibles: " . count($services['services']);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

### Métodos Disponibles

| Método | Descripción |
|--------|-------------|
| `getBalance()` | Obtiene el balance de la cuenta |
| `getServices()` | Lista todos los servicios disponibles |
| `createOrder($service, $link, $quantity)` | Crea una nueva orden |
| `getOrderStatus($orderId)` | Consulta el estado de una orden |
| `getOrderHistory($limit, $offset)` | Obtiene historial de órdenes |
| `cancelOrder($orderId)` | Cancela una orden (si es posible) |
| `getServicesByCategory($category)` | Filtra servicios por categoría |
| `validateInstagramUrl($url)` | Valida URLs de Instagram |

### Crear una Orden

```php
try {
    // Crear orden para 1000 seguidores
    $order = $api->createOrder(
        123,  // ID del servicio (obtener de getServices())
        'https://instagram.com/tu_perfil',
        1000  // Cantidad
    );
    
    echo "Orden creada: " . $order['order_id'];
} catch (Exception $e) {
    echo "Error al crear orden: " . $e->getMessage();
}
```

## 🔐 Seguridad

### Buenas Prácticas Implementadas:

- ✅ **API key nunca expuesta:** El archivo `config/api.php` está en `.gitignore`
- ✅ **Validación de entrada:** URLs y parámetros son validados
- ✅ **Manejo de errores:** Excepciones controladas para API calls
- ✅ **HTTPS:** Verificación SSL habilitada en requests
- ✅ **Timeouts:** Configurables para evitar bloqueos
- ✅ **Headers de seguridad:** User-Agent y Content-Type apropiados

### Configuración de Producción:

1. **Variables de entorno (recomendado):**
   ```php
   'api_key' => $_ENV['MARKETFOLLOWERS_API_KEY'] ?? 'TU_API_KEY_AQUI',
   ```

2. **Permisos de archivos:**
   ```bash
   chmod 600 config/api.php  # Solo lectura para el propietario
   ```

3. **Servidor web:**
   - Configurar HTTPS
   - Denegar acceso directo a `/config/`
   - Habilitar logs de error

## 🌐 Estructura del Proyecto

```
followers.cl/
├── src/
│   └── Api.php              # Clase wrapper de MarketFollowers API
├── config/
│   └── api.php              # Configuración de API (¡NUNCA COMMITEAR!)
├── public/
│   └── test_api.php         # Script de prueba y demostración
├── index.html               # Página principal del sitio
├── script.js                # JavaScript del frontend
├── style.css                # Estilos CSS
├── .gitignore               # Incluye config/api.php
└── README.md                # Esta documentación
```

## 🐛 Solución de Problemas

### Error: "API key is required"
- Verifica que hayas configurado la API key en `config/api.php`
- Asegúrate de que la API key no esté vacía

### Error: "cURL Error: SSL certificate problem"
- Verifica tu configuración SSL
- En desarrollo, temporalmente puedes deshabilitar verificación SSL (NO recomendado para producción)

### Error 401: "Unauthorized"
- Tu API key puede ser inválida
- Verifica que esté correctamente copiada desde MarketFollowers
- Revisa que tu cuenta esté activa

### Error 429: "Rate limit exceeded"
- Has superado el límite de requests por minuto
- Espera antes de hacer más requests
- Implementa delays entre requests si es necesario

## 📞 Soporte

- **Documentación MarketFollowers:** https://marketfollowers.com/docs
- **Soporte MarketFollowers:** support@marketfollowers.com
- **Issues del Proyecto:** https://github.com/pankxo/followers.cl/issues

## 📄 Licencia

Este proyecto es de uso privado para Followers.cl
