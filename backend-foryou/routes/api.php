<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\EmpleadoController;
use App\Http\Controllers\Api\SolicitudController;
use App\Http\Controllers\Api\VisitaController;
use App\Http\Controllers\Api\CotizacionController;
use App\Http\Controllers\Api\DetalleSolicitudController;
use App\Http\Controllers\Api\ProyectoController;
use App\Http\Controllers\Api\PagoController; // Import the controller

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// All API routes that require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('materiales', MaterialController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('empleados', EmpleadoController::class);
    Route::apiResource('solicitudes', SolicitudController::class);
    Route::apiResource('visitas', VisitaController::class);
    Route::apiResource('cotizaciones', CotizacionController::class);
    Route::apiResource('detalles-solicitud', DetalleSolicitudController::class);

    // AI Quoting routes
    Route::post('cotizaciones/suggest-materials', [CotizacionController::class, 'suggestMaterials']);

    // Proyectos API routes
    Route::apiResource('proyectos', ProyectoController::class);
    // Pagos API routes
    Route::apiResource('pagos', PagoController::class);
});
