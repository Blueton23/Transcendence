export function getCookie(name: string): string | null {
    const cookies = document.cookie.split(";");
  
    for (const cookie of cookies) {
      const [key, ...value] = cookie.trim().split("=");
  
      if (key === name) {
        return decodeURIComponent(value.join("="));
      }
    }
    return null;
  }