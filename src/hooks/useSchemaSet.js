import { useState, useEffect, useCallback } from 'react';

/**
 * useSchemaSet - Hook to fetch and manage identity schema sets for a domain
 * 
 * Fetches the schema set (adopted + inherited schemas) for a given domain,
 * providing helpers to determine editability and field sources.
 * 
 * @param {string} domainId - UUID of the domain to fetch schemas for
 * @returns {Object} Schema set state and helpers
 */
export default function useSchemaSet(domainId) {
  const [schemaSet, setSchemaSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchemaSet = useCallback(async () => {
    if (!domainId) {
      setSchemaSet(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/identity/schema/${domainId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schema set: ${response.statusText}`);
      }

      const data = await response.json();
      setSchemaSet(data);
    } catch (err) {
      console.error('Error fetching schema set:', err);
      setError(err.message);
      setSchemaSet(null);
    } finally {
      setLoading(false);
    }
  }, [domainId]);

  useEffect(() => {
    fetchSchemaSet();
  }, [fetchSchemaSet]);

  // Helper: Get adopted schemas only
  const getAdoptedSchemas = useCallback(() => {
    if (!schemaSet || !schemaSet.schemas) return [];
    return schemaSet.schemas.filter(s => s.mode === 'adopted');
  }, [schemaSet]);

  // Helper: Get inherited schemas only
  const getInheritedSchemas = useCallback(() => {
    if (!schemaSet || !schemaSet.schemas) return [];
    return schemaSet.schemas.filter(s => s.mode === 'inherited');
  }, [schemaSet]);

  // Helper: Check if a field is editable (defined in adopted schema)
  const isFieldEditable = useCallback((fieldName) => {
    const adoptedSchemas = getAdoptedSchemas();
    
    for (const schema of adoptedSchemas) {
      const properties = schema.schema_payload?.properties || {};
      if (fieldName in properties) {
        return true;
      }
    }
    
    return false;
  }, [getAdoptedSchemas]);

  // Helper: Get field source (which schema defines a field)
  const getFieldSource = useCallback((fieldName) => {
    if (!schemaSet || !schemaSet.schemas) return null;
    
    // Check adopted schemas first (they have precedence)
    for (const schema of schemaSet.schemas) {
      if (schema.mode === 'adopted') {
        const properties = schema.schema_payload?.properties || {};
        if (fieldName in properties) {
          return {
            schemaId: schema.schema_id,
            mode: 'adopted',
            domainId: schema.source_domain_id,
            definition: properties[fieldName]
          };
        }
      }
    }
    
    // Then check inherited schemas
    for (const schema of schemaSet.schemas) {
      if (schema.mode === 'inherited') {
        const properties = schema.schema_payload?.properties || {};
        if (fieldName in properties) {
          return {
            schemaId: schema.schema_id,
            mode: 'inherited',
            domainId: schema.source_domain_id,
            definition: properties[fieldName]
          };
        }
      }
    }
    
    return null;
  }, [schemaSet]);

  // Helper: Get all fields from effective schema
  const getAllFields = useCallback(() => {
    if (!schemaSet || !schemaSet.effective_schema) return [];
    const properties = schemaSet.effective_schema.properties || {};
    return Object.keys(properties);
  }, [schemaSet]);

  // Helper: Get field definition from effective schema
  const getFieldDefinition = useCallback((fieldName) => {
    if (!schemaSet || !schemaSet.effective_schema) return null;
    const properties = schemaSet.effective_schema.properties || {};
    return properties[fieldName] || null;
  }, [schemaSet]);

  // Helper: Get required fields
  const getRequiredFields = useCallback(() => {
    if (!schemaSet || !schemaSet.effective_schema) return [];
    return schemaSet.effective_schema.required || [];
  }, [schemaSet]);

  return {
    // Core state
    schemaSet,
    loading,
    error,
    
    // Actions
    refetch: fetchSchemaSet,
    
    // Helpers
    getAdoptedSchemas,
    getInheritedSchemas,
    isFieldEditable,
    getFieldSource,
    getAllFields,
    getFieldDefinition,
    getRequiredFields,
    
    // Convenience computed values
    hasAdoptedSchemas: getAdoptedSchemas().length > 0,
    hasInheritedSchemas: getInheritedSchemas().length > 0,
    effectiveSchema: schemaSet?.effective_schema || null,
  };
}
