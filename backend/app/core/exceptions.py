class DomainError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class SerieNotFoundError(DomainError):
    pass


class DirectorNotFoundError(DomainError):
    pass


class DirectorYaAsignadoError(DomainError):
    pass


class AsignacionNotFoundError(DomainError):
    pass


class IntegridadReferencialError(DomainError):
    pass
