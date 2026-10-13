package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setImmersiveFullscreen()

    // Handle Back Button: Toggle pause menu in game
    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          webView?.evaluateJavascript(
            "if (window.gameInstance) { window.gameInstance.togglePause(); }",
            null
          )
        }
      }
    )

    setContent {
      MyApplicationTheme {
        GameScreen(
          onWebViewCreated = { wv ->
            webView = wv
            setupWebView(wv)
          }
        )
      }
    }
  }

  override fun onResume() {
    super.onResume()
    setImmersiveFullscreen()
    webView?.onResume()
  }

  override fun onPause() {
    super.onPause()
    webView?.onPause()
  }

  override fun onDestroy() {
    super.onDestroy()
    webView?.destroy()
    webView = null
  }

  private fun setImmersiveFullscreen() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
  }

  @SuppressLint("SetJavaScriptEnabled")
  private fun setupWebView(wv: WebView) {
    wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)
    wv.settings.apply {
      javaScriptEnabled = true
      domStorageEnabled = true
      allowFileAccess = true
      allowContentAccess = true
      mediaPlaybackRequiresUserGesture = false
      cacheMode = WebSettings.LOAD_DEFAULT
      useWideViewPort = true
      loadWithOverviewMode = true
      builtInZoomControls = false
      displayZoomControls = false
    }

    wv.webChromeClient = WebChromeClient()
    wv.webViewClient = WebViewClient()

    // Add JavaScript Interface for haptics and native persistence
    wv.addJavascriptInterface(AndroidBridge(this), "AndroidBridge")

    wv.loadUrl("file:///android_asset/game/index.html")
  }
}

class AndroidBridge(private val context: Context) {
  private val prefs = context.getSharedPreferences("dimensao_zero_save", Context.MODE_PRIVATE)

  @JavascriptInterface
  fun vibrate(milliseconds: Long) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager =
          context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        val vibrator = vibratorManager?.defaultVibrator
        vibrator?.vibrate(
          VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE)
        )
      } else {
        @Suppress("DEPRECATION")
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator?.vibrate(
            VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE)
          )
        } else {
          @Suppress("DEPRECATION")
          vibrator?.vibrate(milliseconds)
        }
      }
    } catch (_: Exception) {}
  }

  @JavascriptInterface
  fun saveGameData(data: String) {
    prefs.edit().putString("save_data", data).apply()
  }

  @JavascriptInterface
  fun loadGameData(): String {
    return prefs.getString("save_data", "") ?: ""
  }
}

@Composable
fun GameScreen(onWebViewCreated: (WebView) -> Unit) {
  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { ctx ->
      WebView(ctx).apply {
        onWebViewCreated(this)
      }
    }
  )
}
