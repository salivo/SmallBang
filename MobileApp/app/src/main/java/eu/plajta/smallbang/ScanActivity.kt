package eu.plajta.smallbang

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors


class ScanActivity : AppCompatActivity() {
    private lateinit var cameraExecutor: ExecutorService
    private lateinit var previewView: PreviewView
    private var isActivityStarted = false // Flag to check if activity has been started

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scan) // Make sure this matches your layout

        previewView = findViewById(R.id.previewView) // Find the PreviewView in the layout

        cameraExecutor = Executors.newSingleThreadExecutor() // Initialize ExecutorService
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startQRScanner() // Start QR scanner if permission is already granted
        } else {
            requestCameraPermission.launch(Manifest.permission.CAMERA) // Request permission at runtime
        }
    }

    private val requestCameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
        if (isGranted) {
            startQRScanner() // Call the QR scanner if permission is granted
        } else {
            Toast.makeText(this, "Camera permission is required to scan QR codes", Toast.LENGTH_SHORT).show()
        }
    }

    private fun startQRScanner() {
        val scanner = BarcodeScanning.getClient()
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            // Create a Preview use case to display the camera feed
            val preview = Preview.Builder().build()
            preview.setSurfaceProvider(previewView.surfaceProvider)

            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                processImage(imageProxy, scanner)
            }

            // Bind camera lifecycle to the Preview and ImageAnalysis use cases
            cameraProvider.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)
        }, ContextCompat.getMainExecutor(this))
    }

    @OptIn(ExperimentalGetImage::class)
    private fun processImage(imageProxy: ImageProxy, scanner: com.google.mlkit.vision.barcode.BarcodeScanner) {
        if (isActivityStarted) {
            imageProxy.close() // Just close the image if the activity is already started
            return
        }

        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            scanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        Log.d("QRScanner", "QR Code: ${barcode.rawValue}")
                        if (!isActivityStarted) {
                            isActivityStarted = true // Set the flag to true
                            val intent = Intent(this, OrderActivity::class.java)
                            intent.putExtra("order_id", barcode.rawValue) // Pass QR code value to OrderActivity
                            startActivity(intent)
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("QRScanner", "Error scanning QR Code", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown() // Shutdown executor when activity is destroyed
    }
}

