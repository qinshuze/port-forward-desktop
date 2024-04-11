import {PortForward} from "../../hook/PortForwardContext";
import React, {useEffect, useState} from "react";
import {getUUID} from "../../functions";
import {Typography, Button, ConfigProvider, Form, Input, InputNumber, Select, Space} from "antd";
import {SwapOutlined} from "@ant-design/icons";
import "./index.css"

const {Text} = Typography;

export interface InputPortForwardProps {
  value?: PortForward
  onReverse?: (value: PortForward) => void
  onChanged?: (value: PortForward) => void
  onValidated?: (value: boolean) => void
  validate?: boolean
}

const initValue: PortForward = {
  id: getUUID(),
  source: {ip: "", port: 0, proto: "ipv4"},
  target: {ip: "", port: 0, proto: "ipv4"},
}

const protoOptions = [
  {value: "ipv4", label: "ipv4"},
  {value: "ipv6", label: "ipv6"}
]

const ipv4Regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(64:ff9b::(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

export function InputPortForward(props: InputPortForwardProps) {
  const validate: boolean = props.validate || true

  const [value, setValue] = useState(props.value || initValue)
  const [errorText, setErrorText] = useState("")

  const changeHandle = (data: PortForward) => {
    setValue(data)
    props.onChanged?.(data)
  }

  const validator = () => {
    if (!validate) return;
    if (!value.source.ip) return setErrorText(`来源 ${value.source.proto} 地址不能为空`)
    if (value.source.ip) {
      switch (value.source.proto) {
        case "ipv4":
          if (!ipv4Regex.test(value.source.ip)) return setErrorText(`来源 ${value.source.proto} 地址格式不正确`)
          break
        case "ipv6":
          if (!ipv6Regex.test(value.source.ip)) return setErrorText(`来源 ${value.source.proto} 地址格式不正确`)
          break
      }
    }
    if (!value.source.port) return setErrorText("来源端口号不能为空")
    if (!value.target.ip) return setErrorText(`目标 ${value.target.proto} 地址不能为空`)
    if (value.target.ip) {
      switch (value.target.proto) {
        case "ipv4":
          if (!ipv4Regex.test(value.target.ip)) return setErrorText(`目标 ${value.target.proto} 地址格式不正确`)
          break
        case "ipv6":
          if (!ipv6Regex.test(value.target.ip)) return setErrorText(`目标 ${value.target.proto} 地址格式不正确`)
          break
      }
    }
    if (!value.target.port) return setErrorText("目标端口号不能为空")
    if (`${value.source.ip}:${value.source.port}` === `${value.target.ip}:${value.target.port}`) {
      return setErrorText(`来源 ${value.source.ip}:${value.source.port} 地址不能与 目标 ${value.target.ip}:${value.target.port} 地址相同`)
    }

    return setErrorText("")
  }

  const dispatchValidateEvent = () => {
    props.onValidated?.(!errorText)
  }

  const validateHandle = () => {
    validator()
  }

  const reverse = (data: PortForward) => {
    const newValue = {...data, source: data.target, target: data.source}
    setValue(newValue)
    props.onReverse?.(newValue)
  }

  useEffect(() => {
    validateHandle()
  }, []);

  useEffect(() => {
    dispatchValidateEvent()
  }, [errorText]);

  return <>
    <Space.Compact className={errorText && "border-err"}>
      <ConfigProvider autoInsertSpaceInButton={false}>
        <Button style={{backgroundColor: "#f6f6f6"}}>来源</Button>
      </ConfigProvider>
      <Select
        onBlur={validateHandle}
        onSelect={(v) => changeHandle({...value, source: {...value.source, proto: v}})}
        style={{width: 70}} value={value.source.proto}
        options={protoOptions}
      />
      <Input
        onBlur={validateHandle}
        onChange={(e) => changeHandle({...value, source: {...value.source, ip: e.target.value}})}
        style={{width: 150}}
        value={value.source.ip} placeholder="127.0.0.1"
      />
      <InputNumber
        onBlur={validateHandle}
        onChange={(v) => changeHandle({...value, source: {...value.source, port: v || 0}})}
        controls={false}
        style={{width: 60}}
        value={value.source.port || ""}
        placeholder="8080"
      />
      <Button
        onClick={() => reverse(value)}
        style={{backgroundColor: "#f6f6f6"}}
        icon={<SwapOutlined rotate={180}/>}
      />
      <Select
        onBlur={validateHandle}
        onSelect={(v) => changeHandle({...value, target: {...value.target, proto: v}})}
        style={{width: 70}} value={value.target.proto}
        options={protoOptions}
      />
      <Input
        onBlur={validateHandle}
        onChange={(e) => changeHandle({...value, target: {...value.target, ip: e.target.value}})}
        style={{width: 150}}
        value={value.target.ip}
        placeholder="127.0.0.1"
      />
      <InputNumber
        onBlur={validateHandle}
        onChange={(v) => changeHandle({...value, target: {...value.target, port: v || 0}})}
        controls={false}
        style={{width: 60}}
        value={value.target.port || ""}
        placeholder="80"
      />
      <ConfigProvider autoInsertSpaceInButton={false}>
        <Button style={{backgroundColor: "#f6f6f6"}}>目标</Button>
      </ConfigProvider>
    </Space.Compact>
    {errorText && <Text type="danger">{errorText}</Text>}
  </>
}