class RoomMembership {
  constructor () {
    this.members = {};
  }

  addMember = (member) => {
    this.members[member.socketId] = member
  }
}

export default RoomMembership;