def test_create2(address, init_code):
    """
        Adapted from: https://ethereum.stackexchange.com/questions/90895/how-to-implement-the-create2-in-python
    """
    from eth_utils import to_checksum_address
    from web3 import Web3
    
    pre = '0xff'
    b_pre = bytes.fromhex(pre[2:])
    b_address = bytes.fromhex(address[2:])
    
    b_init_code = bytes.fromhex(init_code[2:])
    keccak_b_init_code = Web3.keccak(b_init_code)
    salt = 0
    while(1):
        b_salt = bytes.fromhex(hex(salt)[2:].zfill(64))
        b_result = Web3.keccak(b_pre + b_address + b_salt + keccak_b_init_code)
        result_address = to_checksum_address(b_result[12:].hex())
        print(result_address)
        if(result_address[2:8] == "000000"):
            break
        else:
            salt += 1
    print(salt)



test_create2(
        '0x00000000000000000000000000000000deadbeef',
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    )
