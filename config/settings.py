# Email domains allowed for login
ALLOWED_EMAIL_DOMAINS = [
    '@cuchd.in',
    '@cumail.in'
]

# CAPTCHA settings
CAPTCHA_LENGTH = 6  # X7K9M2 format

# Role permissions
ROLE_PERMISSIONS = {
    'student': {
        'can_view': False,
        'can_search': False,
        'can_upload': False
    },
    'faculty': {
        'can_view': True,
        'can_search': False,
        'can_upload': False
    },
    'security': {
        'can_view': True,
        'can_search': True,
        'can_upload': True
    },
    'admin': {
        'can_view': True,
        'can_search': True,
        'can_upload': True
    }
}

# Default settings
DEFAULT_PASSWORD = 'campustrack2025'  # For demo purposes