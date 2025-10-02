// Test de la función utilitaria
import { getCompanyLogoUrl } from '../utils/urlUtils';

// Test simple
console.log('Test 1:', getCompanyLogoUrl('/uploads/logos/company-logo-1759370915977-145783068.png'));
console.log('Test 2:', getCompanyLogoUrl(null));
console.log('Test 3:', getCompanyLogoUrl(undefined));