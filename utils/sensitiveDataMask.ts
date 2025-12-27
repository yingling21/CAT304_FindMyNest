export function maskSensitiveData(message: string): string {
  let maskedMessage = message;

  const phonePatterns = [
    /(\+?6?0?1[0-9][\s-]?[0-9]{3,4}[\s-]?[0-9]{4})/gi,
    /(\b\d{3}[\s-]?\d{3,4}[\s-]?\d{4}\b)/g,
    /(\b\d{10,11}\b)/g,
  ];

  phonePatterns.forEach(pattern => {
    maskedMessage = maskedMessage.replace(pattern, (match) => {
      if (match.length >= 7) {
        return '*'.repeat(match.length);
      }
      return match;
    });
  });

  const accountPatterns = [
    /\b\d{10,16}\b/g,
    /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/gi,
  ];

  accountPatterns.forEach(pattern => {
    maskedMessage = maskedMessage.replace(pattern, (match) => {
      if (match.length >= 10 && /\d{8,}/.test(match)) {
        return '*'.repeat(match.length);
      }
      return match;
    });
  });

  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  maskedMessage = maskedMessage.replace(emailPattern, (match) => {
    const [localPart, domain] = match.split('@');
    if (localPart.length <= 2) return match;
    return `${localPart.substring(0, 2)}${'*'.repeat(localPart.length - 2)}@${domain}`;
  });

  const cardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  maskedMessage = maskedMessage.replace(cardPattern, () => '**** **** **** ****');

  return maskedMessage;
}

export function containsSensitiveData(message: string): boolean {
  return message !== maskSensitiveData(message);
}
