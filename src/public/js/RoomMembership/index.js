import store from '@js/store';

class RoomMembership {
  constructor (roomId) {
    this.roomId = roomId;
    this.members = {};
  }

  addMember = (member) => {
    const {socketId} = member;
    Object.values(store.get('rooms')).forEach(room => {
      room.memberships.removeMember(socketId);
      if (!room.constructor.isEphemeral && room.editor === socketId) {
        room.setEditor(Object.values(room.memberships.members)[0]);  
      }
    });
    member.state.currentRoomId = this.roomId;
    this.members[socketId] = member;
    member.render();
    member.renderParticipantAvatar();
  }

  renderAvatars = () => {
    Object.values(this.members).forEach(member => {
      member.currentRoomId = this.roomId;
      member.render();
    });
  }

  removeMember = (socketId) => {
    delete this.members[socketId];
  }

  isEmpty = () => {
    return !Object.keys(this.members).length;
  }

  updateSelf = (membershipData) => {
    const {members} = membershipData;
    Object.keys(members).forEach(memberId => {
      const member = store.getPeer(memberId);
      this.addMember(member);
    });
  }
}

export default RoomMembership;