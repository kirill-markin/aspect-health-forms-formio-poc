import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
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
  const webViewRef = useRef<WebView>(null);

  // Generate HTML for Form.io renderer
  const generateFormHTML = () => {
    const formioURL = formioClient.getFormURL(form._id);
    const baseURL = process.env.EXPO_PUBLIC_FORMIO_URL || 'http://localhost:3002';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form.io Renderer</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/formiojs@4.21.3/dist/formio.full.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            margin: 0;
            background-color: #f5f5f5;
        }
        .formio-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .form-title {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
            font-weight: 600;
        }
        .formio-form {
            font-size: 16px;
        }
        .btn-primary {
            background-color: #007AFF;
            border-color: #007AFF;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 8px;
        }
        .btn-primary:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }
        .error-message {
            color: #ff3b30;
            background-color: #ffebee;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }
        /* Form.io specific styling */
        .formio-component-textfield input,
        .formio-component-email input,
        .formio-component-phoneNumber input,
        .formio-component-textarea textarea {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            font-size: 16px;
        }
        .formio-component-textfield input:focus,
        .formio-component-email input:focus,
        .formio-component-phoneNumber input:focus,
        .formio-component-textarea textarea:focus {
            border-color: #007AFF;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0,122,255,0.2);
        }
        .formio-component-radio .radio,
        .formio-component-selectboxes .checkbox {
            margin-bottom: 8px;
        }
        .formio-component-radio input[type="radio"],
        .formio-component-selectboxes input[type="checkbox"] {
            margin-right: 8px;
        }
        .formio-component-select select {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            font-size: 16px;
            width: 100%;
        }
        .formio-component-number input {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            font-size: 16px;
        }
        .formio-component-survey .formio-component-survey-question {
            margin-bottom: 20px;
        }
        .formio-component-survey table {
            width: 100%;
            border-collapse: collapse;
        }
        .formio-component-survey td {
            padding: 8px;
            text-align: center;
        }
        .formio-component-survey input[type="radio"] {
            transform: scale(1.2);
        }
    </style>
</head>
<body>
    <div class="formio-container">
        <h1 class="form-title">${form.title}</h1>
        <div id="formio-form"></div>
        <div id="loading" class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <div id="error" class="error-message" style="display: none;"></div>
    </div>

    <script>
        let formInstance;
        const loadingDiv = document.getElementById('loading');
        const errorDiv = document.getElementById('error');
        const formDiv = document.getElementById('formio-form');

        // Initialize Form.io
        const initializeForm = async () => {
            try {
                // Form definition
                const formDefinition = ${JSON.stringify(form)};
                
                // Create Form.io instance
                formInstance = await Formio.createForm(formDiv, formDefinition, {
                    readOnly: ${readOnly},
                    noAlerts: true,
                    i18n: {
                        en: {
                            submit: 'Submit Form',
                            cancel: 'Cancel',
                            previous: 'Previous',
                            next: 'Next'
                        }
                    },
                    hooks: {
                        beforeSubmit: function(submission, next) {
                            // Send submission data to React Native
                            window.ReactNativeWebView?.postMessage(JSON.stringify({
                                type: 'beforeSubmit',
                                data: submission.data
                            }));
                            next();
                        }
                    }
                });

                // Set initial data if provided
                const initialData = ${JSON.stringify(initialData)};
                if (initialData && Object.keys(initialData).length > 0) {
                    formInstance.submission = { data: initialData };
                }

                // Handle form submission
                formInstance.on('submit', function(submission) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'submit',
                        submission: submission
                    }));
                });

                // Handle form errors
                formInstance.on('error', function(errors) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'error',
                        errors: errors
                    }));
                });

                // Handle form changes
                formInstance.on('change', function(changed) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'change',
                        changed: changed
                    }));
                });

                // Handle form ready
                formInstance.on('render', function() {
                    loadingDiv.style.display = 'none';
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'ready',
                        formId: '${form._id}'
                    }));
                });

                // Hide submit button if requested
                if (!${showSubmitButton}) {
                    setTimeout(() => {
                        const submitButton = formDiv.querySelector('button[type="submit"]');
                        if (submitButton) {
                            submitButton.style.display = 'none';
                        }
                    }, 100);
                }

            } catch (error) {
                console.error('Error initializing form:', error);
                errorDiv.textContent = 'Failed to load form: ' + error.message;
                errorDiv.style.display = 'block';
                loadingDiv.style.display = 'none';
                
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    error: error.message
                }));
            }
        };

        // Handle messages from React Native
        window.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'submit':
                    if (formInstance) {
                        formInstance.submit();
                    }
                    break;
                case 'setData':
                    if (formInstance) {
                        formInstance.submission = { data: message.data };
                    }
                    break;
                case 'getData':
                    if (formInstance) {
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'currentData',
                            data: formInstance.submission.data
                        }));
                    }
                    break;
                case 'validate':
                    if (formInstance) {
                        const isValid = formInstance.checkValidity();
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'validationResult',
                            isValid: isValid,
                            errors: formInstance.errors
                        }));
                    }
                    break;
            }
        });

        // Initialize form when DOM is ready
        document.addEventListener('DOMContentLoaded', initializeForm);
        
        // Fallback initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeForm);
        } else {
            initializeForm();
        }
    </script>
</body>
</html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
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
          onError?.(errorObj);
          break;
          
        case 'change':
          // Handle form data changes if needed
          break;
          
        case 'beforeSubmit':
          // Handle pre-submission logic if needed
          break;
          
        case 'currentData':
          // Handle current form data response
          break;
          
        case 'validationResult':
          // Handle validation results
          break;
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
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

  // Public methods for parent component
  const submitForm = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'submit' }));
  };

  const setFormData = (data: any) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'setData', data }));
  };

  const getFormData = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'getData' }));
  };

  const validateForm = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'validate' }));
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

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading form...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: generateFormHTML() }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error('WebView error:', error);
          setError('Failed to load form interface');
          setIsLoading(false);
        }}
        onHttpError={(error) => {
          console.error('WebView HTTP error:', error);
          setError('Network error loading form');
          setIsLoading(false);
        }}
        startInLoadingState={true}
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#ff3b30',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default FormRenderer;