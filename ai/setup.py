from setuptools import setup, find_packages

setup(
    name='unetiq projectname',
    version='1.0',
    packages=find_packages(exclude=["data", "models"]),
    package_data={'': ['*.yaml']},
    url='',
    license='Apache-2.0',
    author='unetiq',
    author_email='noreply@unetiq.com',
    description=''
)
