var mock = require('mock-require');
var expect = require('chai').expect;

let electronMock = {
    invocationMap: new Map(),
    on: function(eventId, invocation) {
        this.invocationMap.set(eventId, invocation)
    }
};

mock('electron', { ipcMain: electronMock });

let {start, registerEvent, unRegisterEvent, broadcast} = require('../server.js');

describe('ipc bridge server', function() {
    describe('when server is started', function() {
        let invoked, evt, result;

        beforeEach(() => {
            start();
        });

        afterEach(() => {
            electronMock.invocationMap.clear();
        });

        it('Should register request', () => {
            expect(electronMock.invocationMap.get('request')).not.to.be.undefined;
        });

        it('Should register unsubscribe', () => {
            expect(electronMock.invocationMap.get('unsubscribe')).not.to.be.undefined;
        });

        it('Should register subscribe', () => {
            expect(electronMock.invocationMap.get('subscribe')).not.to.be.undefined;
        });

        it('Should register healthcheck', () => {
            expect(electronMock.invocationMap.get('healthcheck')).not.to.be.undefined;
        });

        describe('when a healthcheck is issued', () => {
            let eventId;

            beforeEach(() => {
                evt = {
                    sender: {
                        send: function(id) {
                            eventId = id;
                        }
                    }
                };

                electronMock.invocationMap.get('healthcheck')(evt);
            });

            it('should issue a heartbeat', () => {
                expect(eventId).to.equal('heartbeat');
            });
        });

        describe('when event is registered', () => {
            beforeEach(() => {
                invoked = 0;
                registerEvent('test1', () => {
                    invoked++;
                });
            });

            describe('when request is sent', () => {
                beforeEach(() => {
                    evt = {
                        sender: {
                            send: () => {}
                        }
                    };

                    electronMock.invocationMap.get('request')(evt, {id: 'test1', correlationId: '1'});
                });

                it('should handle the request', () => {
                    expect(invoked).to.equal(1);
                });
            });

            describe('when event is unregistered', () => {
                beforeEach(() => {
                    unRegisterEvent('test1');
                    electronMock.invocationMap.get('request')('request', {id: 'test1', correlationId: '1'});
                });

                it('should not handle the request', () => {
                    expect(invoked).to.equal(0);
                });
            });
        });

        describe('when event is registered with return value', () => {
            beforeEach(() => {
                invoked = 0;
                registerEvent('test2', () => {
                    invoked++;
                    return {
                        correlationId: invoked,
                        data: 'result'
                    };
                });
            });

            describe('when request is sent', () => {
                beforeEach(() => {
                    evt = {
                        sender: {
                            send: function(id, data) {
                                result = data.data;
                            }
                        }
                    };

                    electronMock.invocationMap.get('request')(evt, {id: 'test2', correlationId: '1'});
                });

                it('should handle the request', () => {
                    expect(invoked).to.equal(1);
                });

                it('Should return a value', () => {
                    expect(result).to.equal('result');
                });
            });
        });

        describe('when event is registered with a promise return value', () => {
            beforeEach(() => {
                invoked = 0;
                registerEvent('testPromise', () => {
                    invoked++;
                    return new Promise((resolve, reject) => {
                        resolve('result');
                    });
                });
            });

            describe('when request is sent', () => {
                beforeEach(() => {
                    evt = {
                        sender: {
                            send: function(id, data) {
                                result = data;
                            }
                        }
                    };

                    electronMock.invocationMap.get('request')(evt, {id: 'testPromise', correlationId: '1'});
                });

                it('should handle the request', () => {
                    expect(invoked).to.equal(1);
                });

                it('Should return a value', () => {
                    expect(result).to.equal('result');
                });
            });
        });

        describe('when a subscription is added', () => {
            beforeEach(() => {
                invoked = 0;
                registerEvent('testSub', () => {
                    invoked++;
                    return {
                        correlationId: invoked,
                        data: 'result'
                    };
                });

                evt = {
                    sender: {
                        send: function(id, data) {
                            result = data.data;
                        }
                    }
                };

                electronMock.invocationMap.get('subscribe')(evt, 'testSub');
            });

            describe('and a message is broadcast', () => {
                beforeEach(() => {
                    broadcast('testSub', {
                        data: 'result2'
                    });
                });

                it('Should invoke the callback', () => {
                    expect(invoked).to.equal(1);
                });

                it('Should return the correct data', () => {
                    expect(result).to.equal('result2');
                });
            });

            describe('when subscription is removed', () => {
                beforeEach(() => {
                    electronMock.invocationMap.get('unsubscribe')(evt, 'testSub');
                });

                describe('and message is broadcast', () => {
                    beforeEach(() => {
                        broadcast('testSub', {
                            data: 'result2'
                        });
                    });
    
                    it('Should invoke the callback', () => {
                        expect(invoked).to.equal(1);
                    });
                });
            });
        });
    });
})