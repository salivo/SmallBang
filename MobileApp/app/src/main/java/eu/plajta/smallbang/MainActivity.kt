package eu.plajta.smallbang

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import eu.plajta.smallbang.PocketBaseRepository

class MainActivity : AppCompatActivity() {

    private fun setActivityDefaultState(){
        setContentView(R.layout.activity_main)
        val buttonLogin = findViewById<Button>(R.id.login_btn)
        buttonLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
        }
        val token = PocketBaseRepository.client.authStore.token
        Log.d("Main", "Token: $token")
        if (token != null) {
            val intent = Intent(this, HomeActivity::class.java)
            startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setActivityDefaultState()
    }

    override fun onResume() {
        super.onResume()
        setActivityDefaultState()
    }
}
