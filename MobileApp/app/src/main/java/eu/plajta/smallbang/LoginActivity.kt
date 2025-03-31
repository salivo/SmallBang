package eu.plajta.smallbang

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import eu.plajta.smallbang.PocketBaseRepository
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)
        val emailInput = findViewById<EditText>(R.id.login_email)
        val passwordInput = findViewById<EditText>(R.id.login_password)
        val loginButton = findViewById<Button>(R.id.login_button)
        loginButton.setOnClickListener {
            val email = emailInput.text.toString()
            val password = passwordInput.text.toString()
            lifecycleScope.launch {
                val loginToken = PocketBaseRepository.authenticateUser(email, password)
                if (loginToken != null) {
                    Log.d("PocketBase", "Login Token: $loginToken")
                    Toast.makeText(this@LoginActivity, "Successful login", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this@LoginActivity, MainActivity::class.java)
                    startActivity(intent)
                } else {
                    Log.d("PocketBase", "Login failed")
                }
            }
        }
    }
}