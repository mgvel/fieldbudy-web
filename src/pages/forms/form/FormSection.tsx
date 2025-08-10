import React from 'react';

import FormField from './FormField';

interface FormSectionProps {
  section: {
    id: string;
    title: string;
    fields: Array<{
      id: string;
      value?: string;
    }>;
  };
  responses: Record<string, string>;
  readOnly: boolean;
  onInputChange: (fieldId: string, value: string) => void;
  onOpenChat: (fieldId: string) => void;
  onOpenGallery: (fieldId: string) => void;
  project:string;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  responses,
  readOnly,
  onInputChange,
  onOpenChat,
  onOpenGallery,
  project
}) => {



  return (
    <div key={section.id}>
      {/* <p className="mt-5 text-primary" id={section.id}>
        <strong>{section.title}</strong>
      </p> */}
      
      {section.fields.map((field) => (
        <FormField
        key={field.id}
        field={field}
        value={responses[field.id] || ''}
        readOnly={readOnly}
        onInputChange={onInputChange}
        onOpenChat={onOpenChat}
        onOpenGallery={onOpenGallery}
        projectId={project}
        />
      ))}
    </div>
  );
};

export default FormSection;