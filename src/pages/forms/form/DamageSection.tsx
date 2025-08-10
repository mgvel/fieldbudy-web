import React from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  MenuItem,
  TextField
} from '@mui/material';
import { ExpandMore, Delete } from '@mui/icons-material';
import FormField from './FormField';
import { MessageSquare, Plus } from 'lucide-react';

interface DamageSectionProps {
  roomIndex: number;
  damageCount: number;
  responses: Record<string, any>;
  readOnly: boolean;
  onInputChange: (fieldId: string, value: any) => void;
  onOpenChat: (fieldId: string) => void;
  onAddDamage: () => void;
  onRemoveDamage: () => void;
}

const DamageSection: React.FC<DamageSectionProps> = ({
  roomIndex,
  damageCount,
  responses,
  readOnly,
  onInputChange,
  onOpenChat,
  onAddDamage,
  onRemoveDamage
}) => {
  const damageLocationOptions = [
    'Front-Right',
    'Middle-Right', 
    'Rear-Right',
    'Rear-Middle',
    'Rear-Left',
    'Middle-Left',
    'Front-Left',
    'Front-Middle',
    'Center'
  ];

  const atticAccessOptions = [
    'No attic present',
    'Not accessible to the view',
    'Not accessible to the touch',
    'Attic access denied',
    'Not applicable'
  ];

  const renderDamageFields = (damageIndex: number) => {
    const damageId = `section-room-${roomIndex + 1}-damage-${damageIndex}`;
    
    return (
      <Accordion key={damageIndex} sx={{ mb: 1 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ backgroundColor: '#FEF2F2' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#DC2626',fontSize:"15px" }}>
              Damage {damageIndex}
            </Typography>
            {damageIndex > 1 && !readOnly && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveDamage();
                }}
                sx={{ color: '#EF4444' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Damage Location */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Damage Location
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onOpenChat(`${damageId}-location`)}
                >
                  <MessageSquare size={18} />
                </IconButton>
              </Box>
              <TextField
                select
                fullWidth
                size="small"
                value={responses[`${damageId}-location`] || ''}
                onChange={(e) => onInputChange(`${damageId}-location`, e.target.value)}
                disabled={readOnly}
                placeholder="Select damage location"
              >
                {damageLocationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Attic Access Information */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Attic Access Information
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onOpenChat(`${damageId}-attic`)}
                >
                  <MessageSquare size={18} />
                </IconButton>
              </Box>
              <TextField
                select
                fullWidth
                size="small"
                value={responses[`${damageId}-attic`] || ''}
                onChange={(e) => onInputChange(`${damageId}-attic`, e.target.value)}
                disabled={readOnly}
                placeholder="Select attic access information"
              >
                {atticAccessOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Notes */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Notes
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onOpenChat(`${damageId}-notes`)}
                >
                  <MessageSquare size={18} />
                </IconButton>
              </Box>
              <TextField
                multiline
                rows={3}
                fullWidth
                size="small"
                value={responses[`${damageId}-notes`] || ''}
                onChange={(e) => onInputChange(`${damageId}-notes`, e.target.value)}
                disabled={readOnly}
                placeholder="Notes..."
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ color: '#DC2626', fontWeight: 600, mb: 2 }}>
        Damages
      </Typography>
      
      {Array.from({ length: damageCount }, (_, index) => 
        renderDamageFields(index + 1)
      )}
      
      {!readOnly && (
        <Button
          variant="outlined"
          startIcon={<Plus />}
          onClick={onAddDamage}
          sx={{ 
            mt: 2,
            color: '#DC2626',
            borderColor: '#DC2626',
            '&:hover': {
              backgroundColor: '#FEF2F2',
              borderColor: '#B91C1C'
            }
          }}
        >
          Add Damage
        </Button>
      )}
    </Box>
  );
};

export default DamageSection;