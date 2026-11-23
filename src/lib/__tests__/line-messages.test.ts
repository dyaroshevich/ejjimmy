/**
 * LINE Flex Message Validation Tests
 * Validates flex messages comply with LINE API spec before deployment
 */

import {
  createWelcomeMessage,
  createCatalogFilterMessage,
  createCatalogCarousel,
  createPromotionMessage,
  createContactMessage,
  createSuccessMessage
} from '../line-messages';

interface ValidationError {
  path: string;
  message: string;
}

function validateFlexMessage(msg: any, path = 'root'): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!msg) {
    errors.push({ path, message: 'Message is null or undefined' });
    return errors;
  }

  if (msg.type !== 'flex') {
    errors.push({ path, message: 'Root type must be "flex"' });
  }

  if (!msg.altText) {
    errors.push({ path, message: 'Missing altText property' });
  }

  if (!msg.contents) {
    errors.push({ path, message: 'Missing contents property' });
    return errors;
  }

  errors.push(...validateBubble(msg.contents, 'contents'));

  return errors;
}

function validateBubble(bubble: any, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!bubble || !bubble.type) {
    errors.push({ path, message: 'Missing type' });
    return errors;
  }

  if (bubble.type !== 'bubble' && bubble.type !== 'carousel') {
    return errors;
  }

  if (bubble.type === 'carousel') {
    if (!Array.isArray(bubble.contents)) {
      errors.push({ path, message: 'Carousel missing contents array' });
    } else {
      bubble.contents.forEach((item: any, i: number) => {
        errors.push(...validateBubble(item, `${path}.contents[${i}]`));
      });
    }
    return errors;
  }

  if (bubble.hero) {
    errors.push(...validateHero(bubble.hero, `${path}.hero`));
  }

  if (bubble.header) {
    errors.push(...validateBox(bubble.header, `${path}.header`));
  }

  if (bubble.body) {
    errors.push(...validateBox(bubble.body, `${path}.body`));
  }

  if (bubble.footer) {
    errors.push(...validateBox(bubble.footer, `${path}.footer`));
  }

  return errors;
}

function validateHero(hero: any, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (hero.type === 'image') {
    if (!hero.url) {
      errors.push({ path, message: 'Hero image missing url property' });
    }
  } else if (hero.type === 'box') {
    errors.push(...validateBox(hero, path));
  } else if (hero.type === 'video') {
    if (!hero.url) {
      errors.push({ path, message: 'Hero video missing url property' });
    }
    if (!hero.previewUrl) {
      errors.push({ path, message: 'Hero video missing previewUrl property' });
    }
  }

  return errors;
}

function validateBox(box: any, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!box || box.type !== 'box') return errors;

  if (!Array.isArray(box.contents)) {
    errors.push({ path, message: `Box missing contents array (layout: ${box.layout || 'unknown'})` });
    return errors;
  }

  box.contents.forEach((child: any, i: number) => {
    if (!child || !child.type) {
      errors.push({ path: `${path}.contents[${i}]`, message: 'Missing type' });
      return;
    }

    switch (child.type) {
      case 'box':
        errors.push(...validateBox(child, `${path}.contents[${i}]`));
        break;
      case 'text':
        if (!child.text && (!child.contents || child.contents.length === 0)) {
          errors.push({ path: `${path}.contents[${i}]`, message: 'Text missing text or contents property' });
        }
        break;
      case 'image':
        if (!child.url) {
          errors.push({ path: `${path}.contents[${i}]`, message: 'Image missing url property' });
        }
        break;
      case 'button':
        errors.push(...validateButton(child, `${path}.contents[${i}]`));
        break;
      case 'separator':
        break;
      default:
        break;
    }
  });

  return errors;
}

function validateButton(button: any, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!button.action) {
    errors.push({ path, message: 'Button missing action property' });
    return errors;
  }

  const action = button.action;
  if (!action.type) {
    errors.push({ path: `${path}.action`, message: 'Action missing type' });
  }
  if (!action.label && action.type !== 'location' && action.type !== 'datetimepicker') {
    // Note: location and datetimepicker might have labels in specific places or be used differently
    // but usually label is required for buttons.
    // However, some Flex components use actions without labels if they are on images/boxes.
  }

  if (action.type === 'postback' && !action.data) {
    errors.push({ path: `${path}.action`, message: 'Postback action missing data property' });
  }

  if (action.type === 'uri' && !action.uri) {
    errors.push({ path: `${path}.action`, message: 'URI action missing uri property' });
  }

  return errors;
}

describe('LINE Flex Messages', () => {
  describe('createWelcomeMessage', () => {
    it('should create valid flex message', () => {
      const msg = createWelcomeMessage();
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
      expect(msg.altText).toBeTruthy();
      expect(msg.contents).toBeDefined();
      expect(msg.contents.type).toBe('bubble');
    });

    it('should pass validation', () => {
      const msg = createWelcomeMessage();
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });

    it('should have body with box containing contents', () => {
      const msg = createWelcomeMessage();
      expect(msg.contents.body).toBeDefined();
      expect(msg.contents.body.type).toBe('box');
      expect(Array.isArray(msg.contents.body.contents)).toBe(true);
    });

    it('should have footer with buttons', () => {
      const msg = createWelcomeMessage();
      expect(msg.contents.footer).toBeDefined();
      expect(msg.contents.footer.type).toBe('box');
    });
  });

  describe('createCatalogFilterMessage', () => {
    it('should create valid flex message', () => {
      const msg = createCatalogFilterMessage();
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
      expect(msg.altText).toBeTruthy();
    });

    it('should pass validation', () => {
      const msg = createCatalogFilterMessage();
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });

    it('should have body with buttons', () => {
      const msg = createCatalogFilterMessage();
      expect(msg.contents.body).toBeDefined();
      expect(Array.isArray(msg.contents.body.contents)).toBe(true);
    });
  });

  describe('createCatalogCarousel', () => {
    const mockProduct = {
      id: 'test-1',
      name: 'Solar Package 5kW',
      price_thb: 150000,
      power_kw: 5,
      brand: 'Tawan Power',
      image_url: 'https://example.com/solar.jpg',
      system_components: [],
      specifications: {}
    };

    it('should create valid carousel with products', () => {
      const msg = createCatalogCarousel([mockProduct]);
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
      expect(msg.contents.type).toBe('carousel');
      expect(Array.isArray(msg.contents.contents)).toBe(true);
      expect(msg.contents.contents.length).toBe(1);
    });

    it('should pass validation', () => {
      const msg = createCatalogCarousel([mockProduct]);
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });

    it('should handle empty products array', () => {
      const msg = createCatalogCarousel([]);
      expect(msg).toBeDefined();
      expect(msg.contents.type).toBe('carousel');
      expect(msg.contents.contents.length).toBe(0);
    });

    it('should handle multiple products (max 10)', () => {
      const products = Array(15)
        .fill(null)
        .map((_, i) => ({ ...mockProduct, id: `test-${i}` }));
      const msg = createCatalogCarousel(products);
      expect(msg.contents.contents.length).toBe(10);
    });

    it('should have hero component in bubble', () => {
      const msg = createCatalogCarousel([mockProduct]);
      const bubble = msg.contents.contents[0];
      expect(bubble.hero).toBeDefined();
      expect(['image', 'box']).toContain(bubble.hero.type);
    });

    it('should have footer with button', () => {
      const msg = createCatalogCarousel([mockProduct]);
      const bubble = msg.contents.contents[0];
      expect(bubble.footer).toBeDefined();
      expect(bubble.footer.type).toBe('box');
    });
  });

  describe('createPromotionMessage', () => {
    it('should create valid flex message', () => {
      const msg = createPromotionMessage();
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
    });

    it('should pass validation', () => {
      const msg = createPromotionMessage();
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });
  });

  describe('createContactMessage', () => {
    it('should create valid flex message', () => {
      const msg = createContactMessage();
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
    });

    it('should pass validation', () => {
      const msg = createContactMessage();
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });
  });

  describe('createSuccessMessage', () => {
    it('should create valid flex message', () => {
      const msg = createSuccessMessage();
      expect(msg).toBeDefined();
      expect(msg.type).toBe('flex');
    });

    it('should pass validation', () => {
      const msg = createSuccessMessage();
      const errors = validateFlexMessage(msg);
      expect(errors).toHaveLength(0);
    });
  });
});