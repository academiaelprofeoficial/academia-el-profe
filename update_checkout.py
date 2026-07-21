import os
import re

directory = 'src'
# We want to find body: JSON.stringify({ cursoId, titulo, precio, userId: ... })
# and add userEmail: user?.email

# First, modify /api/checkout/route.ts and /api/checkout/paypal/route.ts
def update_api(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add userEmail to interface
    content = re.sub(r'userId\?: string;', r'userId?: string;\n  userEmail?: string;', content)
    
    # Extract userEmail from body
    content = re.sub(r'let \{ (.*?) \} = body;', lambda m: 'let { ' + m.group(1) + ', userEmail } = body;', content)
    
    # Replace syncUser call
    content = content.replace("await syncUser(userId, '', '');", "if (userEmail) await syncUser(userId, userEmail, '');")
    content = content.replace("await syncUser(userId, '');", "if (userEmail) await syncUser(userId, userEmail);")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_api('src/app/api/checkout/route.ts')
update_api('src/app/api/checkout/paypal/route.ts')

print("APIs updated")

# For frontend files, they usually have: userId: user?.uid || undefined,
# We will append userEmail: user?.email || undefined,
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'userId:' in content and '/api/checkout' in content:
                # Add userEmail after userId if not present
                new_content = re.sub(r'(userId:\s*user\?\.uid\s*\|\|\s*undefined,?)', r'\1\n          userEmail: user?.email || undefined,', content)
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
