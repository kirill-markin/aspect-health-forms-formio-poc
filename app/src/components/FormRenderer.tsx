import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { FormioForm, FormioSubmission, FormioError } from '@/types/formio';
import formioClient from '@/api/formio';

interface FormRendererProps {
  form: FormioForm;
  initialData?: any;
  onSubmit?: (submission: FormioSubmission) => void;
  onError?: (error: FormioError) => void;
  readOnly?: boolean;
  showSubmitButton?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  form,
  initialData = {},
  onSubmit,
  onError,
  readOnly = false,
  showSubmitButton = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple HTML using Form.io CDN
  const generateFormHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${form.title}</title>
    
    <!-- Bootstrap 4 CSS (official Form.io default) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css">
    
    <!-- Form.io CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/formiojs@4.21.3/dist/formio.full.min.css">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 0;
            margin: 0;
            background-color: #f8f9fa;
        }
        .formio-form {
            background: white;
            padding: 20px;
            min-height: 100vh;
        }
        /* Wizard specific improvements */
        .formio-wizard-nav {
            margin-bottom: 30px;
        }
        .formio-wizard-nav .btn {
            margin: 0 5px;
        }
    </style>
</head>
<body>
    <div id="formio-form" class="formio-form"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/formiojs@4.21.3/dist/formio.full.min.js"></script>
    <script>
        const formConfig = {
            readOnly: ${readOnly},
            ${!showSubmitButton ? 'submit: false,' : ''}
        };
        
        const formDefinition = ${JSON.stringify(form)};
        const initialData = ${JSON.stringify(initialData)};
        
        Formio.createForm(document.getElementById('formio-form'), formDefinition, formConfig)
            .then(function(form) {
                // Set initial data
                if (initialData && Object.keys(initialData).length > 0) {
                    form.submission = { data: initialData };
                }
                
                // Handle submission
                form.on('submit', function(submission) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'submit',
                        submission: submission
                    }));
                });
                
                // Handle errors
                form.on('error', function(errors) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'error',
                        errors: errors
                    }));
                });
                
                // Form ready
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'ready',
                    formId: '${form._id}'
                }));
            })
            .catch(function(error) {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    error: error.message
                }));
            });
    </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'ready':
          setIsLoading(false);
          setError(null);
          break;
          
        case 'submit':
          handleSubmission(message.submission);
          break;
          
        case 'error':
          const errorObj: FormioError = {
            name: 'FormioError',
            message: message.error || 'Form error occurred',
            details: message.errors || []
          };
          setError(errorObj.message);
          setIsLoading(false);
          onError?.(errorObj);
          break;
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
      setError('Error communicating with form');
      setIsLoading(false);
    }
  };

  const handleSubmission = async (submission: FormioSubmission) => {
    try {
      setIsLoading(true);
      
      // Create submission on Form.io server
      const serverSubmission = await formioClient.createSubmission(form._id, submission.data);
      
      setIsLoading(false);
      onSubmit?.(serverSubmission);
      
      Alert.alert('Success', 'Form submitted successfully!');
    } catch (error) {
      setIsLoading(false);
      const formioError = error as FormioError;
      setError(formioError.message);
      onError?.(formioError);
      
      Alert.alert('Error', 'Failed to submit form. Please try again.');
    }
  };

  const handleWebViewError = (errorInfo: any) => {
    console.error('WebView error:', errorInfo);
    setError('Failed to load form interface');
    setIsLoading(false);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading form</Text>
          <Text style={styles.errorDetails}>{error}</Text>
        </View>
      </View>
    );
  }

  // Conditional rendering based on platform
  if (Platform.OS === 'web') {
    // For web platform, use iframe
    return (
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading form...</Text>
          </View>
        )}
        
        <iframe
          srcDoc={generateFormHTML()}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'white',
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => handleWebViewError('iframe error')}
        />
      </View>
    );
  }

  // For mobile platforms, use WebView
  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      )}
      
      <WebView
        source={{ html: generateFormHTML() }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        startInLoadingState={false}
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load form</Text>
            <Text style={styles.errorDetails}>{errorName}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    zIndex: 1000,
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FormRenderer;