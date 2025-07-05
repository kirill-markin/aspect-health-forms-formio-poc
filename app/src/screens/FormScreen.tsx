import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FormRenderer } from '@/components/FormRenderer';
import { FormioForm, FormioSubmission, FormioError } from '@/types/formio';
import { theme } from '@/theme';

interface FormScreenRouteParams {
  form: FormioForm;
  initialData?: any;
  readOnly?: boolean;
}

export const FormScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { form, initialData, readOnly = false } = route.params as FormScreenRouteParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFormSubmit = async (submission: FormioSubmission) => {
    setIsSubmitting(false);
    
    Alert.alert(
      'Form Submitted Successfully! 🎉',
      `Your ${form.title} has been submitted with ID: ${submission._id}`,
      [
        {
          text: 'View Response',
          onPress: () => showSubmissionDetails(submission),
        },
        {
          text: 'Back to Forms',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );
  };

  const handleFormError = (error: FormioError) => {
    setIsSubmitting(false);
    
    console.error('Form error:', error);
    
    Alert.alert(
      'Form Error',
      error.message || 'An error occurred while processing the form.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const showSubmissionDetails = (submission: FormioSubmission) => {
    const formattedData = JSON.stringify(submission.data, null, 2);
    
    Alert.alert(
      'Submission Details',
      `Submission ID: ${submission._id}\n\nData:\n${formattedData}`,
      [
        {
          text: 'Share',
          onPress: () => shareSubmission(submission),
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const shareSubmission = async (submission: FormioSubmission) => {
    try {
      const content = `${form.title} - Submission\n\nSubmission ID: ${submission._id}\nSubmitted: ${new Date(submission.created).toLocaleString()}\n\nData:\n${JSON.stringify(submission.data, null, 2)}`;
      
      await Share.share({
        message: content,
        title: `${form.title} Submission`,
      });
    } catch (error) {
      console.error('Error sharing submission:', error);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const renderFormDetails = () => (
    <ScrollView style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Form Details</Text>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Title:</Text>
        <Text style={styles.detailValue}>{form.title}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Name:</Text>
        <Text style={styles.detailValue}>{form.name}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Path:</Text>
        <Text style={styles.detailValue}>/{form.path}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Type:</Text>
        <Text style={styles.detailValue}>{form.type}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Fields:</Text>
        <Text style={styles.detailValue}>{form.components?.length || 0}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Created:</Text>
        <Text style={styles.detailValue}>
          {new Date(form.created).toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Modified:</Text>
        <Text style={styles.detailValue}>
          {new Date(form.modified).toLocaleString()}
        </Text>
      </View>
      
      {form.tags && form.tags.length > 0 && (
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tags:</Text>
          <View style={styles.tagsContainer}>
            {form.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Form ID:</Text>
        <Text style={styles.detailValue}>{form._id}</Text>
      </View>
      
      <Text style={styles.componentsTitle}>Form Components:</Text>
      {form.components?.map((component, index) => (
        <View key={index} style={styles.componentItem}>
          <Text style={styles.componentLabel}>
            {component.label || component.key}
          </Text>
          <Text style={styles.componentDetails}>
            {component.type} • {component.required ? 'Required' : 'Optional'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {form.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              {form.components?.length || 0} fields • {form.type}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={toggleDetails}
          >
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Hide' : 'Info'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDetails ? (
        renderFormDetails()
      ) : (
        <FormRenderer
          form={form}
          initialData={initialData}
          onSubmit={handleFormSubmit}
          onError={handleFormError}
          readOnly={readOnly}
          showSubmitButton={true}
        />
      )}
      
      {readOnly && (
        <View style={styles.readOnlyBanner}>
          <Text style={styles.readOnlyText}>
            📖 This form is in read-only mode
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: theme.colors.text.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    marginRight: 12,
  },
  headerTitleText: {
    color: theme.colors.text.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: theme.colors.text.white,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailsButtonText: {
    color: theme.colors.text.white,
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 24,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#FFF5F8',
    color: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  componentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  componentItem: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  componentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  componentDetails: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  readOnlyBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
  },
  readOnlyText: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FormScreen;