package eu.plajta.smallbang

import android.os.Bundle
import android.util.Log
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import eu.plajta.smallbang.PocketBaseRepository.getOrderInfo
import kotlinx.coroutines.launch

class OrderActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_order)
        val orderLabel: TextView = findViewById(R.id.order_id)
        val customerNameLabel: TextView = findViewById(R.id.customer_name)
        val customerAddressLabel: TextView = findViewById(R.id.customer_address)
        val customerTel: TextView = findViewById(R.id.customer_tel)
        val orderId = intent.getStringExtra("order_id")
        orderLabel.text = orderId
        var orderDetails: OrderRecord? = null
        lifecycleScope.launch {
            try {
                if (orderId != null) {
                    orderDetails = getOrderInfo(orderId)
                    Log.d("PocketBase", "ORDER!!!!!!!!!!!!: ${orderDetails?.customerName}")
                    customerNameLabel.text = orderDetails?.customerName
                    customerAddressLabel.text = orderDetails?.customerAddress
                    customerTel.text = orderDetails?.customerEmail

                }
            } catch (e: Exception) {
                Log.e("DeliverActivity", "Error creating package", e)
            }
        }
        if (orderDetails != null){
            customerNameLabel.text = orderDetails!!.customerName
        }


    }
}