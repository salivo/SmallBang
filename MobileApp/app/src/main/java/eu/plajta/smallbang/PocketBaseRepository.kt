package eu.plajta.smallbang
import android.util.Log
import io.github.agrevster.pocketbaseKotlin.PocketbaseClient
import io.ktor.http.URLProtocol
import kotlinx.serialization.Serializable
import io.github.agrevster.pocketbaseKotlin.models.Record
import kotlinx.serialization.SerialName
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
data class OrderRecord(
    @SerialName("Customer_name") val customerName: String = "",
    @SerialName("Customer_address") val customerAddress: String = "",
    @SerialName("Customer_email") val customerEmail: String = "",
    @SerialName("courier_id") val courierId: String = "",
): Record()

object PocketBaseRepository {
    val client = PocketbaseClient({
        protocol = URLProtocol.HTTP
        host = "172.21.230.111"
        port = 8090
    })

    suspend fun authenticateUser(email: String, password: String): String? {
        return try {
            val token = client.users.authWithPassword(email, password).token
            Log.d("PocketBase", "Token: $token")
            this.client.authStore.token = token
            token
        } catch (e: Exception) {
            Log.e("PocketBase", "Authentication failed", e)
            null
        }
    }

    // Corrected method to use serialization properly
    suspend fun getOrderInfo(id: String): OrderRecord? {
        try {
            val response: OrderRecord = client.records.getOne<OrderRecord>("Orders", id = id)
            Log.d("PocketBase", "Package created: $response")
            return response
        } catch (e: Exception) {
            Log.e("PocketBase", "Failed get data", e)
            return null;
        }
    }
}
