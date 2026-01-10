class Session {
  constructor(user) {
    this.id = user.id;
  }
}
class _Sessions {
  constructor(sessionsIds = new Map(), sessionsEmails = new Map()) {
    this.sessionsIds = sessionsIds;
    this.sessionsEmails = sessionsEmails;
  }

  getSessionByID(id) {
    return this.sessionsIds.get(id);
  }

  getSessionByEmail(email) {
    return this.sessionsEmails.get(email);
  }

  addSession(user) {
    const session = new Session(user, getUserType(user.userType ?? ""));
    this.sessionsIds.set(session.id, session);
    this.sessionsEmails.set(user.email, session);
    return session;
  }
}

const user_ids = {};

module.exports = Sessions;
