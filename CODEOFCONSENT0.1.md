# Togethernet Code of Consent v0.1

The Togethernet Code of Consent (CoC) is a specification that outlines the level of consent and protection that participants have while using the software. Consent is defined as the act of giving permission for something to occur, and we use that term in this document to refer to the permissions that are presented with regards to Togethernet’s users’ data.  

As you read through this Code of Consent, please consider the following invitations: 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We invite you to take your time.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We invite you to dig deeper. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We welcome your pace.   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We welcome your concerns.   

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We invite your enthusiasm.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We invite your participation.  

We acknowledge the trauma that accompanies surrendering information about ourselves in the digital realm without being given insight into how platforms work, and how they protect or expose us in the process.(1) In constructive resistance against that, we offer this document, intended to give you a clear understanding of the ethos and agreements behind this software and how they affect your privacy. 

Structurally informed by the F.R.I.E.S. model created by Planned Parenthood, we believe that a consentful software should be designed and built through the lens of being Freely given, Reversible, Informed, Enthusiastic and Specific. You can learn more about how each of these terms contribute to a more consentful software through the [Consentful Tech Zine](https://www.andalsotoo.net/wp-content/uploads/2018/10/Building-Consentful-Tech-Zine-SPREADS.pdf), published by Una Lee and Dann Toliver under [CC-BY 2017](https://creativecommons.org/licenses/by/4.0/legalcode). 

## The Foundations

Togethernet is a consentful digital archiving software in the form of a desktop web app that allows both peer-to-peer (P2P), traceless messaging as well as archived communications. 

### Who should use this?

This software is for you if you are an artist, designer, community organizer, technologist, researcher, educator, or student who is interested in –

- Exiting surveillance capitalism
- Participating in consentful communications on the web
- Building community-owned digital archives

Togethernet is a software in pursuit of intentional and ongoing consentful engagement that prioritizes the digital autonomy and privacy of our users. We do not sell any of our users’ data nor does the software run on advertising. Those who are seeking a digital environment designed with safety in mind are encouraged to use Togethernet. 

### Access

Togethernet aspires towards accessibility and inclusivity. We acknowledge that the alpha version of the software falls short of that aspiration, as it is not currently fully accessible to the Blind and low-vision community. It is our intention to dedicate future resources towards ensuring that upcoming versions of Togethernet are designed with the needs of this community at the forefront. 

### Who shouldn’t use this?

Togethernet uses WebRTC to conduct peer-to-peer communications, which is encrypted by default but exposes the participant's public IP address in the process of communicating to servers. This software will most likely not have adequate privacy protections for individuals working with highly sensitive issues and who are concerned with targeted surveillance. 

Instead we recommend you looking into [Signal](https://www.signal.org/), an end-to-end encrypted messenger that has been tested by cybersecurity experts all over the world and is trusted by journalists and activists who are working with sensitive content. 

Additionally, this software is not intended for people who are not invested in consentful engagement with others. While the establishment of a consentful digital environment begins within its design infrastructure, the maintenance of this environment relies on a dedicated community. Individuals whose intentions are to cause harm should not use Togethernet. 

### On Developer Responsibilities

Developers who choose to adapt Togethernet’s open-source code in their projects, licenced under [ACSL 1.4](https://github.com/together-support/togethernet/blob/main/LICENSE.md),(2) are expected to adhere to the principles of consent outlined and prioritized by this software, and not alter the code in a way that violates these principles of consent. 

It is imperative that open-source usage of this code aligns with its intended ethos of consent – developers who violate the privacy agreements established in this Code of Consent will be required to disaffiliate from the “Togethernet” name, and remove this Code of Consent document from the code entirely.

We strongly encourage developers to review the [Consentful Tech Zine](https://www.andalsotoo.net/wp-content/uploads/2018/10/Building-Consentful-Tech-Zine-SPREADS.pdf) prior to altering the code in order to ensure that the software remains true to its foundational principles.

#### System Requirements

Togethernet is a desktop web app that launches inside the browser. Currently the application runs as intended on Firefox (version 85.0.2) and Chrome (version 88.0.4324.150). 

#### Capacity

Togethernet intends to facilitate consentful communications, and as we know consent is easier to negotiate within a micro-community. Therefore by default the application will accommodate a maximum of 12 simultaneous participants.(3)

#### Demo

We invite you to [visit this link](https://togethernet.herokuapp.com/) to try out a demo version of the software. In order to test out the collaborative features, we encourage you to invite a friend to join.

## Software Architecture

### Peer to Peer Consent: Ephemeral Channel

On a peer-to-peer level, Togethernet is designed to invite you to say “YES!” along the way. 

While using Togethernet, all text-based communications with your community take place under the Ephemeral Channels. Operating under the logic of peer-to-peer consent, the communication records created during the live session in Ephemeral Mode will be permanently deleted once the last participant closes their browser tab. To prevent messages from being deleted, participants need to go through the Consent to Archive process in order to publish the content to the Archival Channel, allowing the users to make informed decisions regarding their own privacy level while using Togethernet.

In WebRTC, real time communications are achieved without needing to install any additional applications or plug-ins. The information that is transmitted between your browsers is anonymously and freely given by you as a user. There are no logins on Togethernet because on this peer-to-peer level, your identity is not recorded on a centralized system. Furthermore, WebRTC encrypts all data that is sent through it in order to protect users’ communications.  

If you are feeling confused at this point, we invite you to take a moment to imagine:

You and a friend are meeting in the street. Your intentions are to share private information with one another, but prior to that happening, you both require exchanging a secret handshake. The information you share is functionally protected by the mediating act of completing the handshake, whose steps are known only by the two of you. This is akin to the level of privacy enabled by WebRTC’s encryption in peer-to-peer mode. 

Once your peers receive data sent from your browser, you have the agency to remove this data by deleting the messages. In the Ephemeral Channel, messages disappear once the last person in a given chat session departs. If you leave a session but return before the last person has departed, your messages will still be visible and accessible to those in the chat.

#### The Role of the Server

While WebRTC is distinctive in that it enables encrypted peer-to-peer connections via browsers, servers are still required in order to facilitate these connections. Think of the server as an impartial mediator. 

For a connection to be established between you and a peer, information on your respective locations must be exchanged over the server. The information that is given pertains to your local IP address (+ more), which takes place inside your browser and is executed by Javascript and being sent out to what is called the signaling server.(4) Once location data has been sent to the signaling server, it is not retrievable. 

Communication between you and your peer happens via offers and answers that are mediated by this signaling server. These offers, sent by the initiating browser to a receiving browser, occur once you have consented to begin an exchange on the software at the start of the software. 

### Peer-to-Server: Archival Channel

The Archival Channel operates under the logic of peer-to-server consent, where communications are published to a centralized database.

Once messages are published to the Archival Channel, users can enter the room and become an editor. The first person to enter the room is automatically the editor. Subsequent users who enter the chat can become the editor by selecting the function in the bottom-left corner.(5) 

The editor is armed with the ability to delete a message without necessarily having collective consent; as such, this role is one that requires an abundance of care and trust by peer users. It is encouraged that users communicate with their peers prior to removing messages from the archive. When messages are deleted, a trace is left in the archive that labels the removed message as having been deleted by the user. 

The Archival Channel’s default database runs on [PostGres](https://www.postgresql.org/), an open source database that users can run on their own, or a third-party server. Messages in the Archival Channel can be downloaded into an HTML page, which gives users the ability to host the archive of their conversation on their own website if desired. 

It is important to note that data stored on third-party servers might not necessarily adhere to the same consent principles that are outlined in this document. A list of third-party servers and their consent adherence can be found [here](https://en.gendersec.train.tacticaltech.org/downloads/en/autonomous_and_ethical_hosting_providers.pdf). 

### Recap: Adherence to F.R.I.E.S. Model

To understand and place emphasis on how this software adheres to the Planned Parenthood F.R.I.E.S. consent framework, below are Togethernet’s answers to questions posed to developers in the [Consenftul Tech Zine](https://www.andalsotoo.net/wp-content/uploads/2018/10/Building-Consentful-Tech-Zine-SPREADS.pdf).

Are people **Freely** giving us their consent to access and store parts of their digital bodies?

Yes - this document is intended to arm prospective Togethernet users with an understanding of how their digital bodies are accessed, stored, and protected while using the software. Prospective users are invited to reach out with any questions or concerns in case they are not comfortable with the terms outlined here. 

Does your system allow for **Reversible** consent? How easy is it for people to withdraw both their consent and their data?

Yes - in order for messages to be archived, collective consent from all parties in the conversation is required. This consent can be revoked at any time by any individual in the conversation. Revoking consent removes users’ data from the archive, but does not preclude users from continuing to use the software. 

How are we making sure that the consent is **Enthusiastic**? Is there an option not to use this technology, which means that people use it because they prefer to use it? 

In order to use Togethernet, it is required to read through and agree to the Code of Consent, which is aimed at clearly outlining the agreements behind the software. We offer this software, and the embedded Code of Consent as an alternative to softwares that are rooted in surveillance capitalism. For users whose privacy needs are not met by Togethernet, we invite them to explore alternatives such as Signal. 

How are we fully and clearly **Informing** people about what they’re consenting to? Is important information about the risks a user might be exposed to buried in the fine print of the terms & conditions?

Through making use of repetition and robust citation, the information in this document is intended to be clear and consistent. Our intention is to be transparent in the potential risks involved with use. 

This Code of Consent is embedded as part of Togethernet’s Open Source software. As such, it is possible that this software will be re-used and altered in a way such that the code of consent is broken. In such an instance, the developers must take out the code of consent document from the software and disaffiliate from the Togethernet name.

Can people consent to **Specific** things in this system and not others? Can people select which aspects of their digital bodies they want to have exposed and have stored?

Yes - this is accomplished via the consent to archive function, which requests the consent of all participants prior to moving messages into the centralized database or third-party server. Consent to archive must be unanimous - if one participant in the group revokes their consent, the message is removed from the Archival Channel for all parties. 

## Credits

[Consentful Tech Zine](https://www.andalsotoo.net/wp-content/uploads/2018/10/Building-Consentful-Tech-Zine-SPREADS.pdf), written by Una Lee and Dann Toliver and published under CC-BY in 2017 had the foresight of using F.R.I.E.S. (Freely given, Informed, Specific, Reversible, Enthusiastic), a model of consent by Planned Parenthood as a metric to assess data consent in the digital sphere. 

Togethernet’s Code of Consent was compiled by Neema Githere and Xin Xin. 

-------------------------------------------- 


If you feel you understand and agree to Togethernet’s Code of Consent, we invite you to continue onwards to the [orientation](https://togethernet.org/orientation.html). If you do not feel comfortable with the information that has been presented thus far, we invite you to stop to ask a question or present your concern. If you feel you fall somewhere in between, we encourage you to take your time digesting this information and return at your own pace. 

----------------------------------------------

Endnote:

(1) See Also: [Data Trauma](https://www.bitchmedia.org/article/digital-doulas-fixing-data-trauma) by Olivia M. Ross.  
(2) We also ask that a robust politics of citation be adhered to in the adaptation and use of this code and its embedded Code of Consent.  
(3) It is possible to increase the number of participants by changing the environment variable inside the source code, however we don’t recommend doing so without first gaining a good familiarity with how the application works.   
(4) To learn more about the role of the signaling server, we invite you to visit [WebRTC.org](https://webrtc.org/getting-started/peer-connections).  
(5) There can only be one editor at a time in the Archival Channel, and since users maintain default anonymity even in this mode, participants are encouraged to label themselves with a recognizable name (though this does not necessarily need to be a formal or ‘real’ name). 










