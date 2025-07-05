
import { supabase } from '@/integrations/supabase/client';

export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export const callEdgeFunction = async <T = any>(
  functionName: string,
  payload: any,
  options: {
    retries?: number;
    timeout?: number;
    fallbackMessage?: string;
  } = {}
): Promise<EdgeFunctionResponse<T>> => {
  const { retries = 3, timeout = 30000, fallbackMessage = 'Service temporarily unavailable' } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Edge function ${functionName} - Attempt ${attempt}/${retries}`);
      
      // Get auth session
      const { data: session } = await supabase.auth.getSession();
      const authToken = session?.session?.access_token;
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : 'Bearer fallback-token',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error(`Edge function ${functionName} error:`, error);
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message?.includes('400') || error.message?.includes('401')) {
          return {
            success: false,
            error: `Request error: ${error.message}`,
            details: error
          };
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
      
      if (data) {
        console.log(`Edge function ${functionName} success:`, data);
        return {
          success: true,
          data: data as T
        };
      }
      
    } catch (fetchError: any) {
      console.error(`Edge function ${functionName} fetch error:`, fetchError);
      lastError = fetchError;
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }
  
  // All retries failed
  return {
    success: false,
    error: lastError?.message || fallbackMessage,
    details: lastError
  };
};
