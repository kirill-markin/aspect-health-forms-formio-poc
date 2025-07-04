import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormioForm } from '@/types/formio';
import formioClient from '@/api/formio';

export const HomeScreen: React.FC = () => {
  const [forms, setForms] = useState<FormioForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setError(null);
      const fetchedForms = await formioClient.getForms();
      
      // Filter out system forms and only show user-created forms
      const userForms = fetchedForms.filter(form => 
        form.type === 'form' && 
        !form.path.startsWith('admin/') &&
        !form.path.startsWith('user/') &&
        form.path !== 'user' &&
        form.path !== 'admin'
      );
      
      setForms(userForms);
    } catch (err: any) {
      console.error('Error loading forms:', err);
      setError(err.message || 'Failed to load forms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadForms();
  };

  const handleFormPress = (form: FormioForm) => {
    navigation.navigate('FormScreen' as never, { form } as never);
  };

  const handleCreateSampleForm = async () => {
    try {
      setLoading(true);
      
      // Create sample health survey form
      const sampleForm = await createSampleHealthSurvey();
      
      Alert.alert(
        'Success',
        'Sample health survey form created successfully!',
        [
          {
            text: 'OK',
            onPress: () => loadForms(),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error creating sample form:', err);
      Alert.alert('Error', 'Failed to create sample form: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSampleHealthSurvey = async () => {
    const healthSurveyForm: Partial<FormioForm> = {
      title: 'Health Survey Demo',
      name: 'healthSurveyDemo',
      path: 'health-survey-demo',
      type: 'form',
      display: 'form',
      components: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          input: true,
          required: true,
          validate: {
            required: true,
            minLength: 2,
            maxLength: 100,
          },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email',
          input: true,
          required: true,
          validate: {
            required: true,
          },
        },
        {
          type: 'number',
          key: 'age',
          label: 'Age',
          placeholder: 'Enter your age',
          input: true,
          required: true,
          validate: {
            required: true,
            min: 18,
            max: 120,
          },
        },
        {
          type: 'radio',
          key: 'healthRating',
          label: 'How would you rate your overall health?',
          input: true,
          required: true,
          values: [
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' },
          ],
        },
        {
          type: 'textarea',
          key: 'healthConcerns',
          label: 'Do you have any specific health concerns?',
          placeholder: 'Please describe any health concerns...',
          input: true,
          required: false,
          conditional: {
            show: true,
            when: 'healthRating',
            eq: 'fair',
          },
        },
        {
          type: 'textarea',
          key: 'urgentConcerns',
          label: 'Please describe your urgent health concerns:',
          placeholder: 'Please provide details about your health concerns...',
          input: true,
          required: true,
          conditional: {
            show: true,
            when: 'healthRating',
            eq: 'poor',
          },
        },
        {
          type: 'selectboxes',
          key: 'symptoms',
          label: 'Are you currently experiencing any of these symptoms?',
          input: true,
          values: [
            { label: 'Fatigue', value: 'fatigue' },
            { label: 'Headaches', value: 'headaches' },
            { label: 'Difficulty sleeping', value: 'insomnia' },
            { label: 'Digestive issues', value: 'digestive' },
            { label: 'Joint pain', value: 'joint_pain' },
            { label: 'Mood changes', value: 'mood_changes' },
            { label: 'None of the above', value: 'none' },
          ],
        },
        {
          type: 'survey',
          key: 'satisfaction',
          label: 'Satisfaction Survey',
          input: true,
          questions: [
            {
              label: 'How satisfied are you with our healthcare services?',
              value: 'service_satisfaction',
            },
          ],
          values: [
            { label: 'Very Dissatisfied', value: 1 },
            { label: 'Dissatisfied', value: 2 },
            { label: 'Neutral', value: 3 },
            { label: 'Satisfied', value: 4 },
            { label: 'Very Satisfied', value: 5 },
          ],
        },
        {
          type: 'number',
          key: 'npsScore',
          label: 'On a scale of 0-10, how likely are you to recommend our services to a friend or colleague?',
          input: true,
          validate: {
            min: 0,
            max: 10,
          },
        },
        {
          type: 'textarea',
          key: 'feedback',
          label: 'Additional feedback or suggestions:',
          placeholder: 'Please share any additional feedback...',
          input: true,
          required: false,
        },
        {
          type: 'checkbox',
          key: 'consent',
          label: 'I consent to the collection and use of my health information for healthcare purposes',
          input: true,
          required: true,
        },
      ],
      tags: ['health', 'survey', 'demo'],
    };

    return await formioClient.createForm(healthSurveyForm);
  };

  const renderFormItem = ({ item }: { item: FormioForm }) => (
    <TouchableOpacity
      style={styles.formItem}
      onPress={() => handleFormPress(item)}
    >
      <View style={styles.formItemContent}>
        <Text style={styles.formTitle}>{item.title}</Text>
        <Text style={styles.formDescription}>
          {item.name} • {item.components?.length || 0} fields
        </Text>
        <Text style={styles.formPath}>Path: /{item.path}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Forms Available</Text>
      <Text style={styles.emptyStateDescription}>
        Create your first form to get started with data collection.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateSampleForm}
      >
        <Text style={styles.createButtonText}>Create Sample Form</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Error Loading Forms</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadForms}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aspect Health Forms</Text>
        <Text style={styles.headerSubtitle}>Form.io POC</Text>
      </View>

      {error && !loading ? (
        renderError()
      ) : (
        <FlatList
          data={forms}
          renderItem={renderFormItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContainer,
            forms.length === 0 && styles.emptyListContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {forms.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleCreateSampleForm}
        >
          <Text style={styles.floatingButtonText}>+ Sample</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  formItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formItemContent: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  formPath: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;