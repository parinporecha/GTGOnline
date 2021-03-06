import sys
import logging

from re import match
from urllib2 import urlopen, HTTPError
from hashlib import md5

from django.db.models import Q
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from User_backend.models import User_preferences

from Tools.constants import *

User = get_user_model()
log = logging.getLogger(__name__)

def get_user_object(user):
    if isinstance(user, User):
        return user
    elif isinstance(user, str) or isinstance(user, unicode):
        try:
            return User.objects.get(email = user)
        except User.DoesNotExist:
            return None
    else:
        return None
    
def get_bulk_users(email_list):
    return User.objects.filter(email__in = email_list)

def authenticate_user(email, password):
    return authenticate(email = email, password = password)

def login_user(request, email, password):
    user = authenticate(email = email, \
                        password = password)
    if user is not None:
        if user.is_active:
            login(request, user)
            log.info("LogIN -- email = " + user.email + \
                     " | id = " + str(user.id))
            user.api_key = md5(user.password).hexdigest()
            user.save()
            return USER_LOGGED_IN
        else:
            return USER_ACCOUNT_DISABLED
    else:
        return USER_INVALID

def logout_user(request):
    log.info("LogOUT - email = " + request.user.email + \
             " | id = " + str(request.user.id))
    logout(request)

def register_user(email, password, first_name, last_name):
    try:    # Remove this try and validate via js on the clientside itself
        user = User.objects.create_user(email, password)
    except IntegrityError:
        return None
    user.first_name = first_name
    user.last_name = last_name
    user.save()
    user.api_key = md5(user.password).hexdigest()
    user.save()
    return user
    
def does_email_exist(email):
    return User.objects.filter(email = email).exists()

def get_first_name(user):
    return user.get_short_name()

def get_time_format(user):
    return 0

def validate_form(email, password, first_name, last_name):
    if len(password) < 6:
        return False
    elif not email_is_valid(email):
        return False
    elif first_name == '' or last_name == '':
        return False
    return True

def email_is_valid(email):
    if ' ' in email:
        return False
    elif not match(EMAIL_REGEX, email):
        return False
    elif does_email_exist(email):
        return False
    return True

def get_user_details(user):
    return {"email": user.email, "full_name": user.get_full_name()}

#def find_users_from_query(user, query):
#    #groups = user.group_set.all()
#    for group in user.group_set.all():
#        users = group.members.filter(Q(email__icontains = query) | \
#                                Q(first_name__icontains = query) | \
#                                Q(last_name__icontains = query))
#    #users = User.objects.filter(Q(email__icontains = query) | \
#                                #Q(first_name__icontains = query) | \
#                                #Q(last_name__icontains = query))
#    user_list = []
#    for user in users:
#        user_list.append(get_user_details(user))
#    return user_list

def fetch_gravatar_profile(email, email_hash):
    try:
        return urlopen(GRAVATAR_BASE_URL + email_hash + '.json')
    except HTTPError, e:
        log.error('Gravatar profile fetch error for email = "' + email + \
                  '" hash = "' + email_hash + '" error = "' + str(e) + '"')
        return None

def get_api_key(user):
    return user.get_api_key()

def get_user_from_api_key(api_key):
    try:
        return User.objects.get(api_key = api_key)
    except User.DoesNotExist:
        return None
