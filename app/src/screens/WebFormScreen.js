import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function WebFormScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL для iframe встраивания согласно официальной документации Form.io
  const formUrl = 'http://localhost:3002/#/privacy-policy-demo?iframe=1&header=0';

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    // Даем больше времени для загрузки Form.io SPA с iframe параметрами
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError(nativeEvent.description || 'Failed to load form');
    setLoading(false);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      // Обработка событий от формы
      if (data.type === 'formSubmit') {
        Alert.alert(
          'Form Submitted! 🎉',
          'Your form has been successfully submitted.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log('Received message from WebView:', event.nativeEvent.data);
    }
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Failed to Load Form</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setError(null);
          setLoading(true);
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy Demo</Text>
        <View style={styles.placeholder} />
      </View>

      {error ? (
        renderError()
      ) : (
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading form...</Text>
            </View>
          )}
          
          <WebView
            source={{ uri: formUrl }}
            style={styles.webView}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            bounces={false}
            scrollEnabled={true}
            mixedContentMode="compatibility"
            allowsBackForwardNavigationGestures={false}
            // Оптимизации производительности
            cacheEnabled={true}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            androidLayerType="hardware"
            // Настройки для SPA
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            incognito={false}

            // Расширенные настройки безопасности
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('HTTP error:', nativeEvent.statusCode);
            }}
            onRenderProcessGone={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('Render process gone:', nativeEvent.didCrash);
            }}
            onContentProcessDidTerminate={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('Content process terminated:', nativeEvent);
            }}
            // Настройки для Form.io SPA
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            allowsLinkPreview={false}
            automaticallyAdjustContentInsets={false}
            contentInset={{top: 0, left: 0, bottom: 0, right: 0}}
            contentInsetAdjustmentBehavior="never"
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1"
            onShouldStartLoadWithRequest={(request) => {
              console.log('Loading request:', request.url);
              return true;
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
  placeholder: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff3b30',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 