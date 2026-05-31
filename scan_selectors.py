import re
import glob

html_files = glob.glob('*.html')
css_files = glob.glob('css/*.css')
js_files = glob.glob('js/*.js')

classes = set()
ids = set()
onclicks = set()

for path in html_files:
    txt = open(path, encoding='utf-8').read()
    classes |= set(x for s in re.findall(r'class=["\']([^"\']+)["\']', txt) for x in s.split())
    ids |= set(re.findall(r'id=["\']([^"\']+)["\']', txt))
    onclicks |= set(re.findall(r'onclick=["\']([^"\']+)["\']', txt))

css_classes = set()
css_ids = set()
for path in css_files:
    txt = open(path, encoding='utf-8').read()
    txt = re.sub(r'/\*.*?\*/', '', txt, flags=re.S)
    selector_groups = re.findall(r'([^{]+)\{', txt)
    for group in selector_groups:
        for s in group.split(','):
            s = s.strip()
            css_classes |= set(m[1:] for m in re.findall(r'\.[A-Za-z0-9_-]+', s))
            css_ids |= set(m[1:] for m in re.findall(r'\#[A-Za-z0-9_-]+', s))

js_use = set()
js_functions = set()
for path in js_files:
    txt = open(path, encoding='utf-8').read()
    js_use |= set(re.findall(r'document\.(?:getElementById|getElementsByName|getElementsByClassName|querySelector|querySelectorAll)\(["\']([^"\']+)["\']\)', txt))
    js_functions |= set(re.findall(r'function\s+([A-Za-z0-9_]+)\s*\(', txt))

# Normalize JS query selectors to class/id names if they use dot/hash notation.
normalized_js = set()
for sel in js_use:
    if sel.startswith('.'):
        normalized_js.add(sel[1:])
    elif sel.startswith('#'):
        normalized_js.add(sel[1:])
    else:
        normalized_js.add(sel)

inline_funcs = set()
for oc in onclicks:
    inline_funcs |= set(re.findall(r'([A-Za-z0-9_]+)\(', oc))

print('HTML classes:', sorted(classes))
print('HTML ids:', sorted(ids))
print('CSS classes:', sorted(css_classes))
print('CSS ids:', sorted(css_ids))
print('JS functions:', sorted(js_functions))
print('Inline onclick funcs:', sorted(inline_funcs))
print('\n=== MISMATCHES ===')
print('Unused CSS classes (CSS only):', sorted(css_classes - classes))
print('Unused CSS ids (CSS only):', sorted(css_ids - ids))
print('Classes in HTML with no CSS:', sorted(classes - css_classes))
print('IDs in HTML with no CSS:', sorted(ids - css_ids))
print('JS selectors not matched in HTML ids/classes:', sorted(x for x in normalized_js if x not in ids and x not in classes))
print('Inline onclick functions missing in JS:', sorted(inline_funcs - js_functions))
