// Form.io type definitions

export interface FormioForm {
  _id: string;
  title: string;
  name: string;
  path: string;
  type: string;
  display: string;
  components: FormioComponent[];
  settings?: {
    pdf?: any;
    embed?: any;
  };
  properties?: {
    [key: string]: any;
  };
  tags?: string[];
  owner?: string;
  created: string;
  modified: string;
  machineName?: string;
}

export interface FormioComponent {
  type: string;
  key: string;
  label: string;
  input: boolean;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  validate?: {
    required?: boolean;
    custom?: string;
    customPrivate?: boolean;
    json?: any;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    [key: string]: any;
  };
  conditional?: {
    show?: boolean;
    when?: string;
    eq?: string | number | boolean;
    json?: any;
  };
  logic?: FormioLogic[];
  customConditional?: string;
  calculateValue?: string;
  calculateServer?: boolean;
  properties?: {
    [key: string]: any;
  };
  
  // Component-specific properties
  values?: FormioSelectValue[];
  data?: {
    values?: FormioSelectValue[];
    json?: any;
    url?: string;
    resource?: string;
  };
  dataSrc?: string;
  valueProperty?: string;
  template?: string;
  
  // Layout properties
  tableView?: boolean;
  hidden?: boolean;
  clearOnHide?: boolean;
  
  // Styling
  customClass?: string;
  tabindex?: string;
  
  // Advanced
  encrypted?: boolean;
  redrawOn?: string;
  
  // Nested components (for containers)
  components?: FormioComponent[];
  
  // Field-specific properties
  multiple?: boolean;
  defaultValue?: any;
  widget?: {
    type: string;
    [key: string]: any;
  };
  
  // HTML5 input attributes
  mask?: boolean;
  inputMask?: string;
  inputFormat?: string;
  inputType?: string;
  
  // Date/Time
  format?: string;
  datePicker?: {
    [key: string]: any;
  };
  
  // Number
  delimiter?: boolean;
  requireDecimal?: boolean;
  decimalLimit?: number;
  
  // Text area
  rows?: number;
  wysiwyg?: boolean;
  editor?: string;
  
  // File
  storage?: string;
  url?: string;
  options?: {
    [key: string]: any;
  };
  fileTypes?: {
    label: string;
    value: string;
  }[];
  
  // Survey (Rating)
  questions?: {
    label: string;
    value: string;
  }[];
  values?: {
    label: string;
    value: string;
  }[];
}

export interface FormioSelectValue {
  label: string;
  value: string | number;
  shortcut?: string;
}

export interface FormioLogic {
  name: string;
  trigger: {
    type: string;
    simple?: {
      show: boolean;
      when: string;
      eq: string | number | boolean;
    };
    javascript?: string;
    json?: any;
  };
  actions: FormioAction[];
}

export interface FormioAction {
  name: string;
  type: string;
  value?: string;
  text?: string;
  property?: {
    label: string;
    value: string;
    type: string;
  };
  state?: boolean;
  component?: string;
}

export interface FormioSubmission {
  _id: string;
  form: string;
  owner?: string;
  roles?: string[];
  created: string;
  modified: string;
  state: 'submitted' | 'draft';
  data: {
    [key: string]: any;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface FormioError {
  name: string;
  message: string;
  details?: FormioErrorDetail[];
}

export interface FormioErrorDetail {
  message: string;
  path: string[];
  level: 'error' | 'warning' | 'info';
  context?: {
    [key: string]: any;
  };
}

export interface FormioOptions {
  readOnly?: boolean;
  noAlerts?: boolean;
  i18n?: any;
  template?: string;
  saveDraft?: boolean;
  hooks?: {
    [key: string]: Function;
  };
  sanitize?: boolean;
  language?: string;
  flatten?: boolean;
  renderMode?: 'html' | 'flat';
  attachTooltips?: boolean;
  iconset?: string;
  viewAsHtml?: boolean;
  componentOptions?: {
    [key: string]: any;
  };
}

export interface FormioConfig {
  base: string;
  project: string;
  apiKey?: string;
  token?: string;
  formOnly?: boolean;
  debug?: boolean;
}

// React Native specific types
export interface FormioFormScreenProps {
  formId: string;
  initialData?: any;
  onSubmit?: (submission: FormioSubmission) => void;
  onError?: (error: FormioError) => void;
  readOnly?: boolean;
}