try:
    from ._app import app
except ImportError:
    from _app import app
