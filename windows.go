//go:build windows

package main

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"syscall"

	"github.com/sirupsen/logrus"
)

type WindowsPortForwarder struct{}

var log *logrus.Logger

func init() {
	log = logrus.New()
	logFile, err := os.OpenFile("./app.log", os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal("创建日志文件失败:", err)
	}

	log.Out = logFile
}

func removeEmpty(arr []string) []string {
	newArr := make([]string, 0) // 创建一个新的空切片
	for _, str := range arr {
		if str != "" {
			newArr = append(newArr, str) // 将非空字符串添加到新的切片中
		}
	}

	return newArr
}

func contains(slice []int, elem int) bool {
	for _, v := range slice {
		if v == elem {
			return true
		}
	}
	return false
}

func (ws WindowsPortForwarder) Get() ([]PortForward, error) {
	var portForwardList = []PortForward{}

	// 获取命令输出
	command := "netsh interface portproxy show all"
	cmd := exec.Command("cmd", "/C", command)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		log.Error(fmt.Sprintf("Get port mapping error: %v\nCommand: %s\n", err, command))
		return nil, errors.New("操作执行失败，请检查是否有执行权限")
	}

	// 获取端口映射
	reg, _ := regexp.Compile("[^a-zA-Z0-9]")
	outputtext := out.String()
	portmaptext := ""
	arr := removeEmpty(strings.Split(outputtext, "\r\n"))
	protoRow := ""
	continueIndexs := []int{}
	for index, item := range arr {
		if strings.Contains(item, "ipv4:") || strings.Contains(item, "ipv6:") {
			protoRow = item
			continueIndexs = append(continueIndexs, index, index+1, index+2)
		}

		if contains(continueIndexs, index) {
			continue
		}

		portmaptext += reg.ReplaceAllString(protoRow, " ")
		portmaptext += item + ";"
	}

	reg1, _ := regexp.Compile(`\s+`)
	portmaptext = reg1.ReplaceAllString(portmaptext, " ")

	// 获取结果
	arr1 := removeEmpty(strings.Split(portmaptext, ";"))
	for _, item := range arr1 {
		portMapItem := removeEmpty(strings.Split(item, " "))
		sourcePort, _ := strconv.ParseInt(portMapItem[3], 10, 64)
		targetPort, _ := strconv.ParseInt(portMapItem[5], 10, 64)

		sourceProto, err := NewProtocol(portMapItem[0])
		if err != nil {
			log.Error(err.Error())
		}

		targetProto, err := NewProtocol(portMapItem[1])
		if err != nil {
			log.Error(err.Error())
		}

		portForwardList = append(portForwardList, PortForward{
			Source: IpAddress{
				Proto: sourceProto,
				Ip:    portMapItem[2],
				Port:  uint16(sourcePort),
			},
			Target: IpAddress{
				Proto: targetProto,
				Ip:    portMapItem[4],
				Port:  uint16(targetPort),
			},
		})
	}

	return portForwardList, nil
}

func (ws WindowsPortForwarder) Add(pf PortForward) error {
	targetProto := "v4"
	sourceProto := "v4"
	if pf.Source.Proto == IPV6 {
		sourceProto = "v6"
	}

	if pf.Target.Proto == IPV6 {
		targetProto = "v6"
	}

	// 调用系统命令添加端口映射
	command := fmt.Sprintf(
		"netsh interface portproxy add %sto%s listenaddress=%s listenport=%d connectaddress=%s connectport=%d",
		sourceProto, targetProto, pf.Source.Ip, pf.Source.Port, pf.Target.Ip, pf.Target.Port,
	)
	cmd := exec.Command("cmd", "/C", command)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		log.Error(fmt.Sprintf("Add port mapping error: %v\nCommand: %s\n", err, command))
		return fmt.Errorf("操作失败，请检查是否有执行权限")
	}

	return nil
}

func (ws WindowsPortForwarder) BatchAdd(pfs []PortForward) error {

	var rollbackPFs []PortForward

	for index := range pfs {
		err := ws.Add(pfs[index])
		if err != nil {
			err := ws.BatchDelete(rollbackPFs)
			if err != nil {
				return err
			}
			return err
		}

		rollbackPFs = append(rollbackPFs, pfs[index])
	}
	return nil
}

func (ws WindowsPortForwarder) Delete(pf PortForward) error {
	targetProto := "v4"
	sourceProto := "v4"
	if pf.Source.Proto == IPV6 {
		sourceProto = "v6"
	}

	if pf.Target.Proto == IPV6 {
		targetProto = "v6"
	}

	// 调用系统命令删除端口映射
	command := fmt.Sprintf(
		"netsh interface portproxy del %sto%s listenport=%d listenaddress=%s",
		sourceProto, targetProto, pf.Source.Port, pf.Source.Ip,
	)
	cmd := exec.Command("cmd", "/C", command)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

	var out bytes.Buffer
	cmd.Stdout = &out
	err := cmd.Run()
	if err != nil {
		log.Error(fmt.Sprintf("Delete port mapping error: %v\nCommand: %s\n", err, command))
		return fmt.Errorf("操作失败，请检查是否有执行权限")
	}

	return nil
}

func (ws WindowsPortForwarder) BatchDelete(pfs []PortForward) error {

	var rollbackPFs []PortForward

	for index := range pfs {
		err := ws.Delete(pfs[index])
		if err != nil {
			err := ws.BatchAdd(rollbackPFs)
			if err != nil {
				return err
			}
			return err
		}

		rollbackPFs = append(rollbackPFs, pfs[index])
	}

	return nil
}
